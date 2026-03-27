import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../../server/routers";

// Dynamically construct API_BASE_URL from VITE_API_URL environment variable
// VITE_API_URL should NOT include /api/trpc suffix or trailing slash
const getApiBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (apiUrl) {
    // Remove trailing slashes and append /api/trpc
    const cleanUrl = apiUrl.replace(/\/+$/, "");
    console.log(`[tRPC] Using API URL: ${cleanUrl}/api/trpc`);
    return `${cleanUrl}/api/trpc`;
  }
  
  // Fallback to relative path for development
  console.log("[tRPC] No VITE_API_URL provided, using relative path /api/trpc");
  return "/api/trpc";
};

export const trpc = createTRPCReact<AppRouter>();

// Export the API URL getter for use in main.tsx
export const getApiUrl = getApiBaseUrl;

// Export the httpBatchLink configuration for main.tsx
export const createTrpcClient = () => {
  return httpBatchLink({
    url: getApiBaseUrl(),
    fetch: async (input, init?) => {
      const response = await fetch(input, {
        ...init,
        credentials: "include",
      });
      return response;
    },
    transformer: superjson,
  });
};
