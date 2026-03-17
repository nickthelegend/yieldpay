import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertWallet = mutation({
  args: {
    address: v.string(),
    seedHash: v.string(),
    usdtBalance: v.number(),
    ethBalance: v.number(),
    yoShares: v.string(),
    yoUsdtValue: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("wallets")
      .withIndex("by_address", (q) => q.eq("address", args.address))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        lastSyncedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("wallets", {
      ...args,
      createdAt: Date.now(),
      lastSyncedAt: Date.now(),
    });
  },
});

export const updateBalances = mutation({
  args: {
    address: v.string(),
    usdtBalance: v.number(),
    ethBalance: v.number(),
    yoShares: v.string(),
    yoUsdtValue: v.number(),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_address", (q) => q.eq("address", args.address))
      .first();

    if (!wallet) return null;

    await ctx.db.patch(wallet._id, {
      ...args,
      lastSyncedAt: Date.now(),
    });
    return wallet._id;
  },
});

export const updateCreditProfile = mutation({
  args: {
    address: v.string(),
    creditScore: v.number(),
    creditLimit: v.number(),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_address", (q) => q.eq("address", args.address))
      .first();

    if (!wallet) return null;

    await ctx.db.patch(wallet._id, {
      creditScore: args.creditScore,
      creditLimit: args.creditLimit,
    });
  },
});

export const getWallet = query({
  args: { address: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wallets")
      .withIndex("by_address", (q) => q.eq("address", args.address))
      .first();
  },
});
