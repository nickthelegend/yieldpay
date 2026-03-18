'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Minus, Info, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { useState, useEffect } from 'react';
import { fetchYoApr, depositToYoVault, redeemFromYoVault } from '@/lib/yo';
import { clsx } from 'clsx';
import { useToast } from '@/components/Toast';
import { Skeleton } from '@/components/Skeleton';

export default function SavingsPage() {
  const router = useRouter();
  const { address, usdtBalance, yoUsdtValue, yoShares, wdkAccount, refresh, isLoading: walletLoading } = useWallet();
  const { showToast } = useToast();
  const [apr, setApr] = useState<{native: number, reward: number, total: number} | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchYoApr().then(res => setApr({ native: res.nativeApy, reward: res.rewardApy, total: res.totalApr }));
  }, []);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setError(null);
    const tid = showToast('loading', 'Confirming on-chain...');
    try {
        const hash = await depositToYoVault(wdkAccount, parseFloat(amount));
        showToast('success', 'USDT deposited into YO!', hash);
        setAmount('');
        await refresh();
    } catch (e: any) {
        setError(e.message);
        showToast('error', e.message);
    } finally {
        setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (yoShares === 0n) return;
    setLoading(true);
    setError(null);
    const tid = showToast('loading', 'Processing withdrawal...');
    try {
        const hash = await redeemFromYoVault(wdkAccount, yoShares);
        showToast('success', 'Withdrawal successful', hash);
        await refresh();
    } catch (e: any) {
        setError(e.message);
        showToast('error', e.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-secondary min-h-full p-6 space-y-6 font-body">
      {/* Header */}
      <div className="flex items-center justify-between ">
        <button onClick={() => router.back()} className="w-10 h-10 bg-white border-2 border-border-black rounded-xl flex items-center justify-center neo-brutal-hover ">
            <ArrowLeft size={20} />
        </button>
        <div className="bg-white border-2 border-border-black px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ">
            Powered by YO Protocol ⚡️
        </div>
      </div>

      <h1 className="text-4xl font-black tracking-tighter text-left">YO Vault</h1>

      {/* Hero Yield Card */}
      <div className="bg-primary neo-brutal p-6 text-white space-y-2 relative overflow-hidden text-left">
        <div className="text-[10px] font-black uppercase tracking-widest opacity-70 text-left">Currently Earning</div>
        <div className="text-7xl font-black tracking-tighter text-left ">
            {apr ? `${apr.total.toFixed(2)}%` : <Skeleton width="200px" height="60px" />}
        </div>
        <div className="space-y-1 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 text-left">
                {apr ? `Native ${apr.native.toFixed(2)}% + Reward ${apr.reward.toFixed(2)}%` : <Skeleton width="150px" height="12px" />}
            </p>
            <div className="inline-block bg-white text-primary px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ">
                Auto-rebalancing 🔄
            </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-left">
          <div className="bg-accent neo-brutal p-4 space-y-1 text-left">
              <p className="text-[9px] font-black uppercase opacity-60 text-left">Deposited</p>
              <p className="text-xl font-black text-left ">
                {walletLoading ? <Skeleton width="60px" height="24px" /> : `$${yoUsdtValue.toFixed(2)}`}
              </p>
          </div>
          <div className="bg-white neo-brutal p-4 space-y-1 text-left">
              <p className="text-[9px] font-black uppercase opacity-60 text-left">Yield Earned</p>
              <p className="text-xl font-black text-[#00B894] text-left ">+$24.18</p>
          </div>
      </div>

      {/* Deposit Section */}
      <div className="space-y-4 text-left">
        <div className="space-y-2 text-left">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 text-left">Deposit Amount (USDT)</label>
            <div className="relative text-left">
                <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border-3 border-border-black rounded-xl p-4 text-2xl font-black focus:border-4 focus:outline-none transition-all text-left "
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-100 border-2 border-border-black px-2 py-1 rounded-lg text-[10px] font-black uppercase text-center">USDT</div>
            </div>
        </div>

        {error && (
            <div className="bg-[#FF8FAB] border-2 border-border-black p-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 ">
                <Info size={14} /> {error}
            </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-left">
            <button 
                onClick={handleDeposit}
                disabled={loading}
                className="neo-button h-14 bg-border-black text-white text-xs text-center font-body"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Deposit'}
            </button>
            <button 
                onClick={handleWithdraw}
                disabled={loading || yoShares === 0n}
                className="neo-button h-14 bg-white text-xs text-center font-body"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Withdraw All'}
            </button>
        </div>
      </div>

      {/* Accordion */}
      <div className="border-2 border-border-black rounded-2xl overflow-hidden text-left ">
          <AccordionItem title="What is YO Protocol?" />
          <AccordionItem title="How is yield calculated?" />
          <AccordionItem title="Is my collateral safe?" isLast />
      </div>
    </div>
  );
}

function AccordionItem({ title, isLast }: { title: string, isLast?: boolean }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={clsx("bg-white", !isLast && "border-b-2 border-border-black")}>
            <button onClick={() => setOpen(!open)} className="w-full p-4 flex justify-between items-center text-left ">
                <span className="text-xs font-black uppercase text-left ">{title}</span>
                <Plus size={16} className={clsx("transition-transform", open && "rotate-45")} />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div 
                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden text-left"
                    >
                        <p className="px-4 pb-4 text-[10px] font-semibold opacity-60 leading-relaxed text-left ">
                            YO Protocol automatically manages funds across high-yield, low-risk DeFi strategies on Ethereum.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
