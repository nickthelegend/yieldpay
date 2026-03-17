#!/bin/bash
echo "🍴 Starting Ethereum Mainnet Fork..."
echo "📦 USDT: 0xdac17f958d2ee523a2206206994597c13d831ec7"
echo "🏦 YO Gateway: 0xF1EeE0957267b1A474323Ff9CfF7719E964969FA"
echo "🐋 USDT Whale: 0x5754284f345afc66a98fbB0a0Afe71e0F007B949"
echo ""

# Fallback block number if not provided
FORK_BLOCK=${FORK_BLOCK_NUMBER:-21900000}

anvil \
  --fork-url "${ETH_RPC_URL}" \
  --fork-block-number $FORK_BLOCK \
  --port 8545 \
  --block-time 2 \
  --chain-id 1 \
  --accounts 10 \
  --balance 10000 \
  --host 0.0.0.0
