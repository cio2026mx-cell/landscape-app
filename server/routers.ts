import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createPlant, getPlantsByUserId, deletePlant, createInventoryItem, getInventoryByUserId } from "./db";
import { removeBackground } from "./_core/designApi";
import { wavespeedRouter } from "./wavespeed";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Plant management routes
  plants: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Plant name is required"),
        species: z.string().optional(),
        location: z.string().optional(),
        wateringFrequency: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id ?? 1;
        const plant = await createPlant(userId, input);
        if (!plant) throw new Error("Failed to create plant");
        return plant;
      }),
    
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const userId = ctx.user?.id ?? 1;
        return await getPlantsByUserId(userId);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id ?? 1;
        const success = await deletePlant(input.id, userId);
        if (!success) throw new Error("Failed to delete plant");
        return { success: true };
      }),
  }),

  // Inventory management routes
  inventory: router({
    create: protectedProcedure
      .input(z.object({
        itemName: z.string().min(1, "Item name is required"),
        quantity: z.number().default(0),
        category: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id ?? 1;
        const item = await createInventoryItem(userId, input);
        if (!item) throw new Error("Failed to create inventory item");
        return item;
      }),
    
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const userId = ctx.user?.id ?? 1;
        return await getInventoryByUserId(userId);
      }),
  }),

  // Design tools routes
  design: router({
    removeBackground: protectedProcedure
      .input(z.object({
        image: z.string().min(1, "Image URL or Base64 is required"),
      }))
      .mutation(async ({ ctx, input }) => {
        // if (!ctx.user) throw new Error("Unauthorized");
        return await removeBackground(input);
      }),
  }),

  // Wavespeed AI Assistant
  wavespeed: wavespeedRouter,
});

export type AppRouter = typeof appRouter;

// Mock data for fallback when database is unavailable
export const mockPlants = [
  {
    id: 1,
    userId: 1,
    name: "Monstera Deliciosa",
    species: "Monstera deliciosa",
    location: "Living Room",
    wateringFrequency: "Weekly",
    lastWatered: new Date(),
    imageUrl: null,
    notes: "Thriving, needs more light",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    userId: 1,
    name: "Snake Plant",
    species: "Sansevieria trifasciata",
    location: "Bedroom",
    wateringFrequency: "Monthly",
    lastWatered: new Date(),
    imageUrl: null,
    notes: "Low maintenance",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockInventory = [
  {
    id: 1,
    userId: 1,
    itemName: "Potting Soil",
    quantity: 5,
    category: "Soil",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    userId: 1,
    itemName: "Plant Fertilizer",
    quantity: 2,
    category: "Nutrients",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
