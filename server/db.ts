import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, plants, InsertPlant, Plant, inventoryItems, InsertInventoryItem, InventoryItem } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Plant management queries
export async function createPlant(userId: number, plant: Omit<InsertPlant, 'userId'>): Promise<Plant | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create plant: database not available");
    return null;
  }

  try {
    await db.insert(plants).values({
      ...plant,
      userId,
    });
    console.log(`[Database] Plant created: ${plant.name} for user ${userId}`);
    // Return the created plant by querying the latest entry
    const result = await db.select().from(plants).where(eq(plants.userId, userId)).orderBy(plants.createdAt).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create plant:", error);
    return null;
  }
}

export async function getPlantsByUserId(userId: number): Promise<Plant[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get plants: database not available");
    return [];
  }

  try {
    const result = await db.select().from(plants).where(eq(plants.userId, userId));
    console.log(`[Database] Retrieved ${result.length} plants for user ${userId}`);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get plants:", error);
    return [];
  }
}

export async function deletePlant(plantId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete plant: database not available");
    return false;
  }

  try {
    await db.delete(plants).where(and(eq(plants.id, plantId), eq(plants.userId, userId)));
    console.log(`[Database] Plant deleted: ID ${plantId} for user ${userId}`);
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete plant:", error);
    return false;
  }
}

// Inventory management queries
export async function createInventoryItem(userId: number, item: Omit<InsertInventoryItem, 'userId'>): Promise<InventoryItem | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create inventory item: database not available");
    return null;
  }

  try {
    await db.insert(inventoryItems).values({
      ...item,
      userId,
    });
    console.log(`[Database] Inventory item created: ${item.itemName} for user ${userId}`);
    const result = await db.select().from(inventoryItems).where(eq(inventoryItems.userId, userId)).orderBy(inventoryItems.createdAt).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create inventory item:", error);
    return null;
  }
}

export async function getInventoryByUserId(userId: number): Promise<InventoryItem[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get inventory: database not available");
    return [];
  }

  try {
    const result = await db.select().from(inventoryItems).where(eq(inventoryItems.userId, userId));
    console.log(`[Database] Retrieved ${result.length} inventory items for user ${userId}`);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get inventory:", error);
    return [];
  }
}
