import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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

describe("orders status workflow", () => {
  describe("updateStatus", () => {
    it("should update order status from Pending to Ready", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Create an order
      const order = await caller.orders.submit({ item: "Latte" });
      expect(order.status).toBe("Pending");

      // Update status to Ready
      const updated = await caller.orders.updateStatus({
        id: order.id,
        status: "Ready",
      });

      expect(updated.status).toBe("Ready");
      expect(updated.id).toBe(order.id);
      expect(updated.orderNumber).toBe(order.orderNumber);
    });

    it("should update order status from Ready to Completed", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Create an order
      const order = await caller.orders.submit({ item: "Heart Art" });

      // Update to Ready
      const ready = await caller.orders.updateStatus({
        id: order.id,
        status: "Ready",
      });
      expect(ready.status).toBe("Ready");

      // Update to Completed
      const completed = await caller.orders.updateStatus({
        id: order.id,
        status: "Completed",
      });
      expect(completed.status).toBe("Completed");
    });

    it("should persist status changes across list queries", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Create an order
      const order = await caller.orders.submit({ item: "Latte" });
      const initialList = await caller.orders.list();
      const createdOrder = initialList.find(o => o.id === order.id);
      expect(createdOrder?.status).toBe("Pending");

      // Update status
      await caller.orders.updateStatus({
        id: order.id,
        status: "Ready",
      });

      // Verify status persists in list
      const updatedList = await caller.orders.list();
      const updatedOrder = updatedList.find(o => o.id === order.id);
      expect(updatedOrder?.status).toBe("Ready");
    });

    it("should reject invalid status values", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const order = await caller.orders.submit({ item: "Latte" });

      try {
        await caller.orders.updateStatus({
          id: order.id,
          status: "Invalid" as any,
        });
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.message).toContain("Invalid");
      }
    });
  });
});
