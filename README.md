# YieldPay 💳⚡️
> BNPL with yield-bearing collateral. Powered by Tether WDK + YO Protocol + Google Gemini + Convex.

## What It Does
YieldPay is a BNPL (Buy Now, Pay Later) platform where collateral earns yield while locked.
1. 🔐 **Lock USDT** via Tether WDK self-custodial wallet
2. 📈 **Earn ~16.9% APR** on locked collateral via YO Protocol yoUSDT vault
3. 🛍 **Pay in 3** — split any purchase into 3 installments
4. 🤖 **AI Credit Agent** — Google Gemini 1.5 Flash evaluates on-chain wallet history to approve/deny credit
5. 📜 **Agent Activity Feed** — Real-time tracking of all autonomous AI actions via Convex.

## Tech Stack
| Layer | Technology |
|---|---|
| Wallet | Tether WDK (@tetherto/wdk-wallet-evm) |
| Settlement | USDT on Ethereum |
| Yield | YO Protocol yoUSDT vault (ERC-4626) |
| Database | Convex (Real-time sync) |
| Credit AI | Google Gemini 1.5 Flash |
| Frontend | Next.js 15, Tailwind, Framer Motion |
| Testing | Foundry + Anvil mainnet fork |

## Addresses Used
| Contract | Address |
|---|---|
| USDT (Ethereum) | `0xdac17f958d2ee523a2206206994597c13d831ec7` |
| yoUSDT Vault | `0xb9a7da9e90d3b428083bae04b860faa6325b721e` |
| yoGateway | `0xF1EeE0957267b1A474323Ff9CfF7719E964969FA` |

## Running Locally

### 1. Setup Environment
Add the following to `.env.local`:
```bash
NEXT_PUBLIC_CONVEX_URL=https://pleasant-toucan-425.convex.cloud
GEMINI_API_KEY=your_google_ai_studio_key
ANTHROPIC_API_KEY=optional_legacy
```

### 2. Start Anvil Fork
```bash
cd foundry
export ETH_RPC_URL=<your-mainnet-rpc>
./scripts/start-fork.sh
```

### 3. Start Next.js
```bash
npm install
npm run dev
```

### 4. Connect Wallet & Seed (Demo Mode)
1. Open http://localhost:3000/app.
2. Click "Connect WDK Wallet".
3. Open http://localhost:3000/app/dev-tools and click "🐋 Seed 10,000 USDT from Whale".

## Agent Activity
All AI decisions and on-chain triggers are logged to Convex and visible in the **Agent** tab in real-time. This provides full transparency for every credit score and collateral movement.
