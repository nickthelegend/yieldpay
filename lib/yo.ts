import { ETH_RPC } from './wdk';

export const YO_GATEWAY_ABI = [
  "function quotePreviewDeposit(address yoVault, uint256 assets) view returns (uint256 shares)",
  "function quotePreviewWithdraw(address yoVault, uint256 shares) view returns (uint256 assets)",
  "function getAssetAllowance(address yoVault, address owner) view returns (uint256)",
  "function getShareAllowance(address yoVault, address owner) view returns (uint256)",
  "function deposit(address yoVault, uint256 assets, uint256 minSharesOut, address receiver, uint256 partnerId) returns (uint256 shares)",
  "function redeem(address yoVault, uint256 shares, uint256 minAssetsOut, address receiver, uint256 partnerId) returns (uint256 assets)"
];

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function symbol() view returns (string)"
];

export const YO_CONTRACTS = {
  GATEWAY: "0xF1EeE0957267b1A474323Ff9CfF7719E964969FA",
  YO_USDT_VAULT: "0xb9a7da9e90d3b428083bae04b860faa6325b721e",
  USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  PARTNER_ID: 0
};

export async function quoteDeposit(usdtAmount: number): Promise<bigint> {
  const { ethers } = await import('ethers');
  const provider = new ethers.JsonRpcProvider(ETH_RPC);
  const gateway = new ethers.Contract(YO_CONTRACTS.GATEWAY, YO_GATEWAY_ABI, provider);
  const assets = ethers.parseUnits(usdtAmount.toString(), 6);
  return gateway.quotePreviewDeposit(YO_CONTRACTS.YO_USDT_VAULT, assets);
}

export async function quoteRedeem(shares: bigint): Promise<bigint> {
  const { ethers } = await import('ethers');
  const provider = new ethers.JsonRpcProvider(ETH_RPC);
  const gateway = new ethers.Contract(YO_CONTRACTS.GATEWAY, YO_GATEWAY_ABI, provider);
  return gateway.quotePreviewWithdraw(YO_CONTRACTS.YO_USDT_VAULT, shares);
}

export async function getYoShares(address: string): Promise<bigint> {
  const { ethers } = await import('ethers');
  const provider = new ethers.JsonRpcProvider(ETH_RPC);
  const vault = new ethers.Contract(YO_CONTRACTS.YO_USDT_VAULT, ERC20_ABI, provider);
  return vault.balanceOf(address);
}

export async function depositToYoVault(
  wdkAccount: any,
  usdtAmount: number
): Promise<string> {
  const { ethers } = await import('ethers');
  const assets = ethers.parseUnits(usdtAmount.toString(), 6);
  const gatewayAddr = YO_CONTRACTS.GATEWAY;
  
  const usdtInterface = new ethers.Interface(ERC20_ABI);
  const approveData = usdtInterface.encodeFunctionData('approve', [gatewayAddr, assets]);
  await wdkAccount.sendTransaction({ to: YO_CONTRACTS.USDT, value: 0n, data: approveData });

  const quotedShares = await quoteDeposit(usdtAmount);
  const minSharesOut = quotedShares * 99n / 100n;

  const gatewayInterface = new ethers.Interface(YO_GATEWAY_ABI);
  const depositData = gatewayInterface.encodeFunctionData('deposit', [
    YO_CONTRACTS.YO_USDT_VAULT,
    assets,
    minSharesOut,
    await wdkAccount.getAddress(),
    YO_CONTRACTS.PARTNER_ID
  ]);
  const depositTx = await wdkAccount.sendTransaction({ to: gatewayAddr, value: 0n, data: depositData });
  return depositTx.hash;
}

export async function redeemFromYoVault(
  wdkAccount: any,
  shares: bigint
): Promise<string> {
  const { ethers } = await import('ethers');
  const gatewayAddr = YO_CONTRACTS.GATEWAY;

  const erc20Interface = new ethers.Interface(ERC20_ABI);
  const approveData = erc20Interface.encodeFunctionData('approve', [gatewayAddr, shares]);
  await wdkAccount.sendTransaction({ to: YO_CONTRACTS.YO_USDT_VAULT, value: 0n, data: approveData });

  const quotedAssets = await quoteRedeem(shares);
  const minAssetsOut = quotedAssets * 99n / 100n;

  const gatewayInterface = new ethers.Interface(YO_GATEWAY_ABI);
  const redeemData = gatewayInterface.encodeFunctionData('redeem', [
    YO_CONTRACTS.YO_USDT_VAULT,
    shares,
    minAssetsOut,
    await wdkAccount.getAddress(),
    YO_CONTRACTS.PARTNER_ID
  ]);
  const redeemTx = await wdkAccount.sendTransaction({ to: gatewayAddr, value: 0n, data: redeemData });
  return redeemTx.hash;
}

export async function fetchYoApr(): Promise<{ nativeApy: number, rewardApy: number, totalApr: number }> {
  try {
    const res = await fetch('https://api.yo.xyz/v1/vaults');
    const data = await res.json();
    const vault = data.vaults?.find((v: any) => v.address?.toLowerCase() === '0xb9a7da9e90d3b428083bae04b860faa6325b721e');
    if (vault) {
      return {
        nativeApy: vault.nativeApy ?? 4.9,
        rewardApy: vault.rewardApy ?? 12.0,
        totalApr: (vault.nativeApy ?? 4.9) + (vault.rewardApy ?? 12.0)
      };
    }
  } catch (e) {
    console.warn('YO APR fetch failed, using fallback');
  }
  return { nativeApy: 4.9, rewardApy: 12.0, totalApr: 16.9 };
}
