#!/bin/bash
# ── Config ──────────────────────────────────────────────
ANVIL_RPC="http://localhost:8545"
USDT="0xdac17f958d2ee523a2206206994597c13d831ec7"
WHALE="0x5754284f345afc66a98fbB0a0Afe71e0F007B949"
BACKUP_WHALE="0xF977814e90dA44bFA03b6295A0616a897441aceC"

# ── Target wallet: pass as arg or use default test address ──
TARGET="${1}"
if [ -z "$TARGET" ]; then
  echo "Usage: ./seed.sh <your-wdk-wallet-address>"
  echo "Example: ./seed.sh 0xYourAddress"
  exit 1
fi

echo "🐋 Seeding $TARGET with USDT from whale..."

# Step 1: Impersonate whale
cast rpc anvil_impersonateAccount "$WHALE" \
  --rpc-url "$ANVIL_RPC"
echo "✅ Impersonated whale: $WHALE"

# Step 2: Give whale ETH for gas (anvil_setBalance)
cast rpc anvil_setBalance \
  "$WHALE" \
  "0x56BC75E2D63100000" \
  --rpc-url "$ANVIL_RPC"
echo "⛽️ Funded whale with ETH for gas"

# Step 3: Transfer 10,000 USDT (6 decimals = 10_000_000_000) to target
cast send "$USDT" \
  "transfer(address,uint256)(bool)" \
  "$TARGET" \
  "10000000000" \
  --from "$WHALE" \
  --rpc-url "$ANVIL_RPC" \
  --unlocked
echo "💵 Transferred 10,000 USDT to $TARGET"

# Step 4: Also give target ETH for gas
cast rpc anvil_setBalance \
  "$TARGET" \
  "0x56BC75E2D63100000" \
  --rpc-url "$ANVIL_RPC"
echo "⛽️ Funded $TARGET with 100 ETH for gas"

# Step 5: Stop impersonating
cast rpc anvil_stopImpersonatingAccount "$WHALE" \
  --rpc-url "$ANVIL_RPC"

echo ""
echo "✅ DONE. $TARGET now has:"
echo " 10,000 USDT"
echo " 100 ETH (for gas)"
echo ""
echo "🔍 Verify:"
cast call "$USDT" \
  "balanceOf(address)(uint256)" \
  "$TARGET" \
  --rpc-url "$ANVIL_RPC"
