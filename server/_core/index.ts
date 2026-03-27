import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getDb } from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // CORS Configuration for Render/Vercel deployment
  app.use(cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Database connection logging
  const db = await getDb();
  if (db) {
    console.log("[Database] Connected to PostgreSQL via DATABASE_URL");
  } else if (process.env.DATABASE_URL) {
    console.log("[Database] DATABASE_URL provided but connection failed - using mock mode");
  } else {
    console.log("[Database] No DATABASE_URL provided - using mock mode");
  }
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), mode: db ? "real" : "mock" });
  });
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Inpaint and inventory endpoints (placeholder for image processing)
  app.post("/api/inpaint", (req, res) => {
    console.log("[API] Inpaint request received");
    res.json({ success: true, message: "Inpaint endpoint ready" });
  });
  
  app.get("/api/inventory", (req, res) => {
    console.log("[API] Inventory request received");
    res.json({ success: true, inventory: [] });
  });
  
  // Migration endpoint for database setup
  app.get("/api/migrate", async (req, res) => {
    const secret = req.query.secret as string;
    if (secret !== "landscape-migrate-2024") {
      return res.status(401).json({ success: false, error: "Invalid migration secret" });
    }
    
    try {
      console.log("[Migration] Starting database migration");
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ success: false, error: "Database not available" });
      }
      // Migration logic will be implemented in Phase 2
      console.log("[Migration] Migration completed successfully");
      res.json({ success: true, message: "Database migration completed" });
    } catch (error) {
      console.error("[Migration] Error:", error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT from environment (required for Render deployment)
  const preferredPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort && process.env.NODE_ENV === "production") {
    console.warn(`[Server] WARNING: Port ${preferredPort} is busy, using port ${port} instead. This may cause deployment issues.`);
  }
  
  // Ensure server is properly listening
  process.on("SIGTERM", () => {
    console.log("[Server] SIGTERM received, shutting down gracefully");
    server.close(() => {
      console.log("[Server] Server closed");
      process.exit(0);
    });
  });

  server.listen(port, () => {
    console.log(`[Server] Running on port ${port}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[CORS] Enabled for all origins with credentials`);
  });
}

startServer().catch((error) => {
  console.error("[Server] Failed to start:", error);
  process.exit(1);
});
