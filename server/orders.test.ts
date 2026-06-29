import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Test suite for the orders feature.
 * Tests order submission and retrieval functionality.
 */

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("orders", () => {
  describe("submit", () => {
    it("should create a Latte order with sequential order number", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const order = await caller.orders.submit({ item: "Latte" });

      expect(order).toBeDefined();
      expect(order.item).toBe("Latte");
      expect(order.orderNumber).toBeGreaterThan(0);
      expect(order.createdAt).toBeDefined();
    });

    it("should create a Heart Art order with sequential order number", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const order = await caller.orders.submit({ item: "Heart Art" });

      expect(order).toBeDefined();
      expect(order.item).toBe("Heart Art");
      expect(order.orderNumber).toBeGreaterThan(0);
      expect(order.createdAt).toBeDefined();
    });

    it("should reject invalid item types", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.orders.submit({ item: "Invalid Item" } as any);
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toContain("Invalid");
      }
    });
  });

  describe("list", () => {
    it("should return all orders", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const initialOrders = await caller.orders.list();
      const initialCount = initialOrders.length;

      await caller.orders.submit({ item: "Latte" });

      const updatedOrders = await caller.orders.list();

      expect(updatedOrders.length).toBe(initialCount + 1);
      expect(updatedOrders[0]).toBeDefined();
      expect(updatedOrders[0].item).toBe("Latte");
    });

    it("should return orders sorted by creation time (newest first)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const order1 = await caller.orders.submit({ item: "Latte" });
      const order2 = await caller.orders.submit({ item: "Heart Art" });

      const orders = await caller.orders.list();

      expect(orders.length).toBeGreaterThanOrEqual(2);
      
      const order2Index = orders.findIndex(o => o.orderNumber === order2.orderNumber);
      const order1Index = orders.findIndex(o => o.orderNumber === order1.orderNumber);
      
      expect(order2Index).toBeGreaterThanOrEqual(0);
      expect(order1Index).toBeGreaterThanOrEqual(0);
      expect(order2Index).toBeLessThan(order1Index);
    });
  });
});
