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

describe("staff", () => {
  describe("verifyPassword", () => {
    it("should accept the correct staff password", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const staffPassword = process.env.STAFF_PASSWORD || "staff123";
      const result = await caller.staff.verifyPassword({ password: staffPassword });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.staff.verifyPassword({ password: "wrongpassword" });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
        expect(error.message).toContain("Invalid password");
      }
    });

    it("should reject empty password", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.staff.verifyPassword({ password: "" });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });
});
