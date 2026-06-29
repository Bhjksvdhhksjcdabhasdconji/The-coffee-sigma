import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createOrder, getAllOrders, deleteOrder, updateOrderStatus } from "./db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

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

  orders: router({
    submit: publicProcedure
      .input(z.object({ item: z.enum(["Latte", "Heart Art"]) }))
      .mutation(async ({ input }) => {
        const order = await createOrder(input.item);
        return order;
      }),
    list: publicProcedure.query(async () => {
      const allOrders = await getAllOrders();
      return allOrders;
    }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteOrder(input.id);
        return { success: true };
      }),
    updateStatus: publicProcedure
      .input(z.object({ id: z.number(), status: z.enum(["Pending", "Ready", "Completed"]) }))
      .mutation(async ({ input }) => {
        const order = await updateOrderStatus(input.id, input.status);
        return order;
      }),
  }),

  staff: router({
    verifyPassword: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input }) => {
        const staffPassword = process.env.STAFF_PASSWORD || "staff123";
        if (input.password !== staffPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid password",
          });
        }
        return { success: true };
      }),
  })
});

export type AppRouter = typeof appRouter;
