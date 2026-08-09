import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const tokenSchema = z.object({ token: z.string().min(3).max(64) });

const createOrderSchema = z.object({
  token: z.string().min(3).max(64),
  sessionId: z.string().min(1).max(64),
  note: z.string().max(300).optional(),
  items: z
    .array(z.object({ menuItemId: z.string().uuid(), quantity: z.number().int().min(1).max(50) }))
    .min(1)
    .max(50),
});

export const getPublicMenu = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { loadPublicMenu } = await import("./public-menu.server");
    return loadPublicMenu(data.token);
  });

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createOrderSchema.parse(data))
  .handler(async ({ data }) => {
    const { createOrderSecure } = await import("./public-menu.server");
    return createOrderSecure(data);
  });

export const getPublicOrder = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ orderId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { loadPublicOrder } = await import("./public-menu.server");
    return loadPublicOrder(data.orderId);
  });

export const getTableOrders = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ token: z.string().min(3).max(64), sessionId: z.string().min(1).max(64) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { loadTableOrders } = await import("./public-menu.server");
    return loadTableOrders(data.token, data.sessionId);
  });

export const trackEvent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        eventType: z.string().min(1).max(40),
        token: z.string().max(64).optional(),
        itemId: z.string().uuid().optional(),
        categoryId: z.string().uuid().optional(),
        sessionId: z.string().max(64).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { recordEvent } = await import("./public-menu.server");
    return recordEvent(data);
  });
