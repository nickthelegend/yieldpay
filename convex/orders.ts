import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrder = mutation({
  args: {
    walletAddress: v.string(),
    merchantName: v.string(),
    merchantEmoji: v.string(),
    itemName: v.string(),
    totalAmount: v.number(),
    installmentAmount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bnplOrders", {
      ...args,
      installmentCount: 3,
      status: "pending_approval",
      collateralLocked: 0,
      yoSharesLocked: "0",
      installmentsPaid: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const approveOrder = mutation({
  args: { orderId: v.id("bnplOrders") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: "approved",
      updatedAt: Date.now(),
    });
  },
});

export const activateOrder = mutation({
  args: {
    orderId: v.id("bnplOrders"),
    depositTxHash: v.string(),
    yoSharesLocked: v.string(),
    collateralLocked: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: "active",
      depositTxHash: args.depositTxHash,
      yoSharesLocked: args.yoSharesLocked,
      collateralLocked: args.collateralLocked,
      nextPaymentDue: Date.now() + 30 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now(),
    });
  },
});

export const recordInstallmentPaid = mutation({
  args: {
    orderId: v.id("bnplOrders"),
    txHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return;

    const newCount = order.installmentsPaid + 1;
    const isComplete = newCount >= order.installmentCount;

    await ctx.db.patch(args.orderId, {
      installmentsPaid: newCount,
      status: isComplete ? "completed" : "active",
      nextPaymentDue: isComplete ? undefined : Date.now() + 30 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now(),
    });
  },
});

export const getOrdersByWallet = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bnplOrders")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .order("desc")
      .collect();
  },
});

export const getOrder = query({
  args: { orderId: v.id("bnplOrders") },
  handler: async (ctx, args) => await ctx.db.get(args.orderId),
});
