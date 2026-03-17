import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logAction = mutation({
  args: {
    walletAddress: v.string(),
    orderId: v.optional(v.id("bnplOrders")),
    action: v.union(
      v.literal("credit_scored"),
      v.literal("collateral_deposited"),
      v.literal("collateral_redeemed"),
      v.literal("installment_paid"),
      v.literal("yield_harvested"),
      v.literal("order_completed"),
      v.literal("order_defaulted")
    ),
    details: v.string(),
    txHash: v.optional(v.string()),
    amountUsdt: v.optional(v.number()),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("agentLogs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const saveCreditDecision = mutation({
  args: {
    walletAddress: v.string(),
    orderId: v.optional(v.id("bnplOrders")),
    usdtBalance: v.number(),
    ethBalance: v.number(),
    txCount: v.number(),
    requestedAmount: v.number(),
    isExistingVaultUser: v.boolean(),
    approved: v.boolean(),
    creditLimit: v.number(),
    score: v.number(),
    reason: v.string(),
    riskLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    geminiModel: v.string(),
    latencyMs: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("creditDecisions", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getAgentLogs = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("agentLogs")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .order("desc")
      .take(20);
  },
});

export const getCreditHistory = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("creditDecisions")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .order("desc")
      .take(5);
  },
});
