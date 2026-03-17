import { GoogleGenerativeAI } from "@google/generative-ai"
import { ethers } from "ethers"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { ETH_RPC } from "@/lib/wdk"

const USDT_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7"
const YO_USDT_VAULT = "0xb9a7da9e90d3b428083bae04b860faa6325b721e"
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"]

export async function POST(req: Request) {
  try {
    const { address, requestedAmount, orderId } = await req.json()
    const t0 = Date.now()

    // 1. Fetch on-chain data
    const provider = new ethers.JsonRpcProvider(ETH_RPC)
    const usdt = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider)
    const yoVault = new ethers.Contract(YO_USDT_VAULT, ERC20_ABI, provider)

    const [usdtRaw, yoSharesRaw, txCount, ethRaw] = await Promise.all([
      usdt.balanceOf(address),
      yoVault.balanceOf(address),
      provider.getTransactionCount(address),
      provider.getBalance(address),
    ])

    const usdtBalance = Number(usdtRaw) / 1_000_000
    const ethBalance = Number(ethers.formatUnits(ethRaw, 18))
    const isExistingVaultUser = yoSharesRaw > 0n

    // 2. Call Gemini 1.5 Flash (Using the most common free model name)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `You are a DeFi credit scoring agent for YieldPay BNPL. Analyze this wallet and return ONLY valid JSON, no markdown, no explanation.
Wallet:
- USDT Balance: $${usdtBalance.toFixed(2)}
- ETH Balance: ${ethBalance.toFixed(4)} ETH
- Transaction Count: ${txCount}
- Existing YO Vault User: ${isExistingVaultUser}
- Requested BNPL Amount: $${requestedAmount}

Rules:
- Approve if USDT >= 30% of requested amount OR txCount > 20
- Credit limit = min(usdtBalance * 2, 500)
- Score 300-850 based on balance + tx history + vault usage

Return exactly this JSON structure: {"approved":bool,"creditLimit":number,"score":number,"reason":"1 sentence","riskLevel":"low"|"medium"|"high"}`;

    let decision: any
    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text().trim()
      // Strip any accidental markdown fences
      const clean = text.replace(/`json|```/g, "").trim()
      decision = JSON.parse(clean)
    } catch (e) {
      console.error("Gemini failed, using fallback:", e)
      // Fallback rule-based decision
      decision = {
        approved: usdtBalance >= requestedAmount * 0.3 || txCount > 20,
        creditLimit: Math.min(usdtBalance * 2, 500),
        score: 500 + Math.min(txCount * 5, 200) + (isExistingVaultUser ? 50 : 0),
        reason: "Rule-based fallback: AI agent temporarily unavailable.",
        riskLevel: usdtBalance > requestedAmount ? "low" : "medium",
      }
    }

    // 3. Save to Convex
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
    
    const decisionId = await convex.mutation(api.agent.saveCreditDecision, {
      walletAddress: address,
      orderId: orderId ?? undefined,
      usdtBalance,
      ethBalance,
      txCount,
      requestedAmount,
      isExistingVaultUser,
      ...decision,
      geminiModel: "gemini-1.5-flash",
      latencyMs: Date.now() - t0,
    })

    // Update wallet credit profile in Convex
    await convex.mutation(api.wallets.updateCreditProfile, {
      address,
      creditScore: decision.score,
      creditLimit: decision.creditLimit,
    })

    // Log agent action
    await convex.mutation(api.agent.logAction, {
      walletAddress: address,
      orderId: orderId ?? undefined,
      action: "credit_scored",
      details: `AI scored wallet. Score: ${decision.score}, Approved: ${decision.approved}`,
      success: true,
      amountUsdt: requestedAmount,
    })

    return Response.json({
      success: true,
      decision,
      onChainData: { usdtBalance, ethBalance, txCount, isExistingVaultUser },
      decisionId,
    })
  } catch (error: any) {
    console.error("Credit score API error:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
