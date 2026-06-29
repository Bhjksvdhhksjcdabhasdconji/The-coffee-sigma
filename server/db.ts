import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, orders, Order } from "../drizzle/schema";
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

/**
 * Get the next order number by finding the maximum existing order number.
 */
export async function getNextOrderNumber(): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(orders).orderBy(desc(orders.orderNumber)).limit(1);
  const lastOrder = result[0];
  return (lastOrder?.orderNumber || 0) + 1;
}

/**
 * Create a new order with the given item.
 */
export async function createOrder(item: string): Promise<Order> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const orderNumber = await getNextOrderNumber();
  const result = await db.insert(orders).values({
    orderNumber,
    item,
  });

  // Fetch and return the created order
  const createdOrder = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);

  return createdOrder[0]!;
}

/**
 * Get all orders sorted by creation time (newest first).
 */
export async function getAllOrders(): Promise<Order[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

/**
 * Delete an order by ID.
 */
export async function deleteOrder(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(orders).where(eq(orders.id, id));
}

/**
 * Update order status.
 */
export async function updateOrderStatus(id: number, status: "Pending" | "Ready" | "Completed"): Promise<Order> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updated = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id));

  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0]!;
}
