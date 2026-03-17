import WalletManagerEvm from '@tetherto/wdk-wallet-evm'

export const ETH_RPC = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_USE_FORK === 'true')
  ? (process.env.NEXT_PUBLIC_FORK_RPC ?? 'http://localhost:8545') 
  : 'https://rpc.mevblocker.io/fast';

export function createWalletManager(seedPhrase: string) {
  return new WalletManagerEvm(seedPhrase, {
    provider: ETH_RPC,
    transferMaxFee: 5000000000000000 // 0.005 ETH max fee
  })
}

export async function generateSeedPhrase(): Promise<string> {
  const { ethers } = await import('ethers')
  return ethers.Wallet.createRandom().mnemonic?.phrase ?? ''
}
