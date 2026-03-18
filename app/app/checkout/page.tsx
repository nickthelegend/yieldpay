'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Loader2, Lock, ChevronRight, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { clsx } from 'clsx';
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { depositToYoVault } from '@/lib/yo';
import { useToast } from '@/components/Toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { address, wdkAccount, refresh, usdtBalance } = useWallet();
  const { showToast } = useToast();
  
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [locking, setLocking] = useState(false);
  const [decision, setDecision] = useState<any>(null);

  const createOrder = useMutation(api.orders.createOrder);
  const approveOrder = useMutation(api.orders.approveOrder);
  const activateOrder = useMutation(api.orders.activateOrder);
  const logAction = useMutation(api.agent.logAction);

  const handleStartAnalysis = async () => {
    setAnalyzing(true);
    try {
        // 1. Create order in Convex
        const id = await createOrder({
            walletAddress: address,
            merchantName: "NFD Marketplace",
            merchantEmoji: "🏷️",
            itemName: "AlgoName.algo",
            totalAmount: 99,
            installmentAmount: 33,
        });
        setOrderId(id);

        // 2. Call Gemini Credit Agent
        const res = await fetch('/api/credit-score', {
            method: 'POST',
            body: JSON.stringify({ address, requestedAmount: 99, orderId: id })
        });
        const data = await res.json();
        setDecision(data.decision);
        
        if (data.decision.approved) {
            await approveOrder({ orderId: id });
        }
        
        setStep(2);
    } catch (e) {
        console.error(e);
        showToast('error', 'AI analysis failed. Try again.');
    } finally {
        setAnalyzing(false);
    }
  };

  const handleLockCollateral = async () => {
    if (!orderId || !wdkAccount) return;
    setLocking(true);
    const tid = showToast('loading', 'Opening WDK signer...');
    
    try {
        // Real on-chain lock into YO Vault
        const txHash = await depositToYoVault(wdkAccount, 33);
        
        // Activate order in Convex
        await activateOrder({
            orderId,
            depositTxHash: txHash,
            yoSharesLocked: "0", // In real flow we'd get shares from quote/receipt
            collateralLocked: 33,
        });

        await logAction({
            walletAddress: address,
            orderId,
            action: "collateral_deposited",
            details: "Locked $33 USDT in yoUSDT vault",
            txHash,
            amountUsdt: 33,
            success: true,
        });

        showToast('success', 'Collateral locked!', txHash);
        await refresh();
        setStep(3);
    } catch (e: any) {
        console.error(e);
        showToast('error', e.message);
    } finally {
        setLocking(false);
    }
  };

  return (
    <div className="bg-background min-h-full p-6 flex flex-col text-left font-body">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 ">
        <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="w-10 h-10 bg-white border-2 border-border-black rounded-xl flex items-center justify-center neo-brutal-hover ">
            <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2 ">
            {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center ">
                    <div className={clsx(
                        "w-8 h-8 rounded-full border-2 border-border-black flex items-center justify-center font-black text-xs transition-colors ",
                        step === s ? "bg-border-black text-white" : step > s ? "bg-primary text-white" : "bg-white text-border-black"
                    )}>
                        {step > s ? '✓' : s}
                    </div>
                    {s < 3 && <div className="w-4 h-0.5 bg-border-black" />}
                </div>
            ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
            className="space-y-6 flex-1 flex flex-col "
          >
            <h1 className="text-4xl font-black tracking-tighter text-left">Review Order</h1>
            
            <div className="neo-brutal bg-white p-4 flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-3xl ">🏷️</div>
                <div className="flex-1 text-left">
                    <p className="text-[10px] font-black uppercase opacity-40 text-left ">NFD Marketplace</p>
                    <p className="text-sm font-black uppercase text-left ">AlgoName.algo</p>
                </div>
                <p className="text-xl font-black text-right ">$99.00</p>
            </div>

            <div className="bg-accent neo-brutal p-6 space-y-4 text-left">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-left ">Pay in 3 installments</p>
                <div className="space-y-2 text-left ">
                    <InstallmentRow label="Today" amount="$33.00" active />
                    <InstallmentRow label="+30 Days" amount="$33.00" />
                    <InstallmentRow label="+60 Days" amount="$33.00" />
                </div>
                <p className="text-[9px] font-bold uppercase opacity-60 text-left ">0% interest. No fees.</p>
            </div>

            <div className="bg-card-2 neo-brutal p-4 flex items-center gap-4 text-left ">
                <Lock size={24} className="" />
                <div className="text-left">
                    <p className="text-xs font-black uppercase text-left ">$33 USDT locked as collateral</p>
                    <p className="text-[9px] font-bold uppercase opacity-60 text-left ">Earning yield while locked ⚡️</p>
                </div>
            </div>

            <button 
                onClick={handleStartAnalysis}
                disabled={analyzing}
                className="neo-button w-full h-16 bg-border-black text-white text-lg mt-auto flex items-center justify-center gap-3 "
            >
                {analyzing ? (
                    <><Loader2 className="animate-spin" size={20} /> Analyzing Wallet...</>
                ) : (
                    <>Continue <ChevronRight size={20} /></>
                )}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
            className="space-y-6 flex-1 flex flex-col "
          >
            <h1 className="text-4xl font-black tracking-tighter text-left ">Confirm & Lock</h1>

            {decision && (
                <div className={clsx(
                    "neo-brutal p-6 space-y-2 text-left ",
                    decision.approved ? "bg-secondary" : "bg-card-1"
                )}>
                    <div className="flex justify-between items-center text-left ">
                        <p className="text-[10px] font-black uppercase opacity-60 text-left ">Credit Agent Decision</p>
                        <span className="text-xs font-black text-right ">Score: {decision.score}</span>
                    </div>
                    <p className="text-xl font-black uppercase leading-none text-left ">{decision.approved ? `Approved for $${decision.creditLimit} limit ✅` : 'Application Denied ❌'}</p>
                    <p className="text-[10px] font-bold uppercase opacity-60 text-left ">{decision.reason}</p>
                </div>
            )}

            <div className="neo-card bg-white border-2 p-4 flex items-center justify-between text-left ">
                <span className="text-[10px] font-black uppercase opacity-40 text-left ">Collateral to lock</span>
                <span className="text-xl font-black text-right ">$33.00 USDT</span>
            </div>

            <div className="space-y-4 text-left ">
                <div className="flex justify-between items-center text-[10px] font-black uppercase opacity-40 px-2 text-left ">
                    <span>Destination</span>
                    <span>Fee Estimate</span>
                </div>
                <div className="neo-brutal bg-white p-4 flex justify-between items-center text-left ">
                    <div className="flex items-center gap-2 text-left ">
                        <div className="w-2 h-2 rounded-full bg-primary " />
                        <span className="text-xs font-black uppercase text-left ">YO Ethereum Vault</span>
                    </div>
                    <span className="text-[10px] font-black opacity-40 text-right ">~$4.20 gas</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-20 text-center">
                <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Lock size={64} strokeWidth={3} className="" />
                </motion.div>
                <p className="text-[10px] font-black uppercase tracking-widest text-center ">Signing with WDK...</p>
            </div>

            <button 
                onClick={handleLockCollateral}
                disabled={locking || !decision?.approved}
                className={clsx(
                    "neo-button w-full h-16 text-white text-lg mt-auto ",
                    decision?.approved ? "bg-primary" : "bg-zinc-400 cursor-not-allowed"
                )}
            >
                {locking ? <Loader2 className="animate-spin" size={20} /> : 'Confirm & Lock Collateral'}
            </button>
          </motion.div>
        )}

        {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="space-y-8 flex-1 flex flex-col items-center justify-center text-center bg-secondary -mx-6 -my-6 p-12 text-center"
            >
                <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="text-9xl mb-4 text-center"
                >
                    ✅
                </motion.div>
                <div className="space-y-2 text-center">
                    <h1 className="text-5xl font-black tracking-tighter leading-none text-center text-center">You're all set!</h1>
                    <p className="text-sm font-bold uppercase opacity-60 text-center text-center">Collateral is earning 16.9% APR while locked.</p>
                </div>

                <div className="neo-card bg-white w-full p-6 space-y-4 text-left text-left">
                    <div className="flex justify-between items-center text-left ">
                        <span className="text-[10px] font-black opacity-40 uppercase text-left ">Merchant</span>
                        <span className="text-xs font-black uppercase text-right ">NFD Marketplace</span>
                    </div>
                    <div className="flex justify-between items-center text-left ">
                        <span className="text-[10px] font-black opacity-40 uppercase text-left ">Amount</span>
                        <span className="text-xs font-black uppercase text-right ">$99.00 USDT</span>
                    </div>
                    <div className="flex justify-between items-center text-left ">
                        <span className="text-[10px] font-black uppercase text-left ">Schedule</span>
                        <span className="text-xs font-black uppercase text-right text-primary ">3 Monthly Pays</span>
                    </div>
                </div>

                <div className="w-full space-y-4 text-center">
                    <button onClick={() => router.push('/app/credit')} className="neo-button w-full h-16 bg-border-black text-white text-lg shadow-[6px_6px_0_0_#FFE500] ">
                        View Active Plans →
                    </button>
                    <button onClick={() => router.push('/app')} className="text-[10px] font-black uppercase tracking-widest opacity-40 underline ">
                        Back to Home
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InstallmentRow({ label, amount, active }: { label: string, amount: string, active?: boolean }) {
    return (
        <div className={clsx(
            "flex justify-between items-center p-3 border-2 border-border-black rounded-xl text-left ",
            active ? "bg-white" : "bg-white/40 opacity-60"
        )}>
            <span className="text-[10px] font-black uppercase text-left ">{label}</span>
            <span className="text-sm font-black text-right ">{amount}</span>
        </div>
    );
}
