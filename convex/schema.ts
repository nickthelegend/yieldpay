import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // One row per wallet address — the user's YieldPay profile
  wallets: defineTable({
    address: v.string(), // "0xabc..."
    seedHash: v.string(), // sha256 of seed — NEVER store seed itself
    usdtBalance: v.number(), // last known USDT balance (human readable)
    ethBalance: v.number(), // last known ETH balance
    yoShares: v.string(), // bigint as string (JSON can't handle bigint)
    yoUsdtValue: v.number(), // value of shares in USDT
    creditScore: v.optional(v.number()),
    creditLimit: v.optional(v.number()),
    createdAt: v.number(), // Date.now()
    lastSyncedAt: v.number(),
  }).index("by_address", ["address"]),

  // Each BNPL order
  bnplOrders: defineTable({
    walletAddress: v.string(),
    merchantName: v.string(),
    merchantEmoji: v.string(),
    itemName: v.string(),
    totalAmount: v.number(), // e.g. 99.00
    installmentAmount: v.number(), // e.g. 33.00
    installmentCount: v.number(), // always 3
    status: v.union(
      v.literal("pending_approval"),
      v.literal("approved"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("defaulted")
    ),
    // YO vault data
    collateralLocked: v.number(), // USDT amount locked
    yoSharesLocked: v.string(), // bigint as string
    depositTxHash: v.optional(v.string()),
    // Payment tracking
    installmentsPaid: v.number(), // 0, 1, 2, 3
    nextPaymentDue: v.optional(v.number()), // timestamp
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_wallet", ["walletAddress"])
    .index("by_status", ["status"]),

  // AI credit decisions — log every Gemini call
  creditDecisions: defineTable({
    walletAddress: v.string(),
    orderId: v.optional(v.id("bnplOrders")),
    // Input to Gemini
    usdtBalance: v.number(),
    ethBalance: v.number(),
    txCount: v.number(),
    requestedAmount: v.number(),
    isExistingVaultUser: v.boolean(),
    // Gemini output
    approved: v.boolean(),
    creditLimit: v.number(),
    score: v.number(),
    reason: v.string(),
    riskLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    // Meta
    geminiModel: v.string(),
    latencyMs: v.number(),
    createdAt: v.number(),
  }).index("by_wallet", ["walletAddress"]),

  // Agent activity log — every autonomous action the AI agent takes
  agentLogs: defineTable({
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
    details: v.string(), // human readable description
    txHash: v.optional(v.string()),
    amountUsdt: v.optional(v.number()),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_wallet", ["walletAddress"])
    .index("by_order", ["orderId"]),
});
