'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { createWalletManager, generateSeedPhrase } from '@/lib/wdk';
import { getYoShares, quoteRedeem } from '@/lib/yo';
import { formatUnits } from 'ethers';
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const USDT_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const SEED_KEY = "yieldpay_seed";

interface WalletContextType {
  address: string;
  usdtBalance: number;
  ethBalance: number;
  yoShares: bigint;
  yoUsdtValue: number;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>;
  wdkAccount: any;
  walletData: any;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string>('');
  const [usdtBalance, setUsdtBalance] = useState<number>(0);
  const [ethBalance, setEthBalance] = useState<number>(0);
  const [yoShares, setYoShares] = useState<bigint>(0n);
  const [yoUsdtValue, setYoUsdtValue] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [wdkAccount, setWdkAccount] = useState<any>(null);

  const upsertWallet = useMutation(api.wallets.upsertWallet);
  const updateBalances = useMutation(api.wallets.updateBalances);
  const walletData = useQuery(api.wallets.getWallet, address ? { address } : "skip");

  const fetchBalances = useCallback(async (account: any) => {
    try {
      const addr = await account.getAddress();
      const [rawUsdt, rawEth, shares] = await Promise.all([
        account.getTokenBalance(USDT_ADDRESS),
        account.getBalance(),
        getYoShares(addr)
      ]);

      const usdtVal = Number(rawUsdt) / 1_000_000;
      const ethVal = Number(formatUnits(rawEth, 18));
      
      let usdtSharesVal = 0;
      if (shares > 0n) {
        try {
          const quoted = await quoteRedeem(shares);
          usdtSharesVal = Number(quoted) / 1_000_000;
        } catch (e) {
          console.error("Quote redeem failed:", e);
        }
      }

      setAddress(addr);
      setUsdtBalance(usdtVal);
      setEthBalance(ethVal);
      setYoShares(shares);
      setYoUsdtValue(usdtSharesVal);

      return { addr, usdtVal, ethVal, shares, usdtSharesVal };
    } catch (e) {
      console.error("Fetch balances failed:", e);
      throw e;
    }
  }, []);

  const connect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let seed = localStorage.getItem(SEED_KEY);
      let phrase = "";
      if (seed) {
        phrase = atob(seed);
      } else {
        phrase = await generateSeedPhrase();
        localStorage.setItem(SEED_KEY, btoa(phrase));
      }

      const manager = createWalletManager(phrase);
      const account = await manager.getAccount(0);
      setWdkAccount(account);
      const { addr, usdtVal, ethVal, shares, usdtSharesVal } = await fetchBalances(account);
      
      await upsertWallet({
        address: addr,
        seedHash: btoa(phrase).slice(0, 32),
        usdtBalance: usdtVal,
        ethBalance: ethVal,
        yoShares: shares.toString(),
        yoUsdtValue: usdtSharesVal,
      });

      setIsConnected(true);
    } catch (e: any) {
      console.error("Connect error:", e);
      setError(e.message);
      localStorage.removeItem(SEED_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem(SEED_KEY);
    setAddress('');
    setUsdtBalance(0);
    setEthBalance(0);
    setYoShares(0n);
    setYoUsdtValue(0);
    setIsConnected(false);
    setWdkAccount(null);
  };

  const refresh = async () => {
    if (wdkAccount) {
      setIsLoading(true);
      try {
        const { addr, usdtVal, ethVal, shares, usdtSharesVal } = await fetchBalances(wdkAccount);
        await updateBalances({
          address: addr,
          usdtBalance: usdtVal,
          ethBalance: ethVal,
          yoShares: shares.toString(),
          yoUsdtValue: usdtSharesVal,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const seed = localStorage.getItem(SEED_KEY);
    if (seed) {
      connect();
    }
  }, []);

  const value = {
    address, usdtBalance, ethBalance, yoShares, yoUsdtValue,
    isConnected, isLoading, error, connect, disconnect, refresh, wdkAccount, walletData
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
