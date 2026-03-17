'use client';

import { motion } from 'framer-motion';
import { Plus, ArrowUpRight, ShoppingBag, CreditCard, TrendingUp, Lock, RefreshCcw, LogOut, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/components/Toast';
import { Skeleton } from '@/components/Skeleton';
import Link from 'next/link';

export default function DashboardPage() {
  const { isConnected, address, usdtBalance, ethBalance, yoUsdtValue, connect, disconnect, refresh, isLoading, walletData } = useWallet();
  const { showToast } = useToast();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8 bg-background font-archivo italic">
        <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-8xl"
        >
            🔐
        </motion.div>
        <h1 className="text-4xl font-black italic tracking-tighter leading-tight text-center">
            Connect Wallet<br/>to Start
        </h1>
        <button 
            onClick={async () => {
                showToast('loading', 'Generating wallet...');
                try {
                    await connect();
                    showToast('success', 'Wallet connected!');
                } catch (e: any) {
                    showToast('error', e.message);
                }
            }}
            disabled={isLoading}
            className="neo-button w-full h-16 bg-border-black text-white gap-2 italic"
        >
            {isLoading ? <Loader2 className="animate-spin" /> : <Lock size={20} />}
            Connect WDK Wallet
        </button>
        <p className="text-[10px] font-bold uppercase opacity-40 italic text-center">
            Self-custodial. Powered by Tether WDK.
        </p>
      </div>
    );
  }

  const totalBalance = usdtBalance + yoUsdtValue;
  const isGasLow = ethBalance < 0.001;

  return (
    <div className="p-6 space-y-6 font-archivo italic text-left">
      {/* Top Bar */}
      <div className="flex justify-between items-center italic">
        <h1 className="text-3xl font-black italic tracking-tighter text-left">YieldPay</h1>
        <div className="flex items-center gap-3 italic">
            <div className="bg-white border-2 border-border-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest neo-brutal-hover cursor-pointer flex items-center gap-2 italic">
                {address.slice(0, 6)}...{address.slice(-4)}
            </div>
            <button 
                onClick={() => {
                    disconnect();
                    showToast('success', 'Disconnected');
                }} 
                className="text-[#FF4D4D] p-1 neo-brutal-hover italic"
            >
                <LogOut size={16} />
            </button>
        </div>
      </div>

      {isGasLow && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#FFD93D] border-3 border-border-black p-4 flex items-center gap-3 italic text-left"
          >
              <AlertCircle className="text-primary" size={24} />
              <p className="text-[10px] font-black uppercase leading-tight italic text-left">Low ETH for gas. Add ETH to transact.</p>
          </motion.div>
      )}

      {/* Hero Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-accent neo-brutal p-6 space-y-2 relative overflow-hidden italic text-left"
      >
        <div className="flex justify-between items-start italic text-left">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60 italic text-left italic">Total Balance</div>
            <button 
                onClick={async () => {
                    showToast('loading', 'Refreshing balances...');
                    await refresh();
                    showToast('success', 'Balances updated');
                }} 
                className={clsx(isLoading && "animate-spin")}
            >
                <RefreshCcw size={14} className="opacity-40" />
            </button>
        </div>
        <div className="text-5xl font-black italic tracking-tighter text-left italic">
            {isLoading ? <Skeleton width="180px" height="48px" /> : `$${totalBalance.toFixed(2)}`}
        </div>
        <div className="flex items-center gap-2 pt-2 italic text-left">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse border border-border-black italic" />
            <span className="text-[10px] font-black uppercase tracking-widest text-border-black italic">Earning 16.9% APR</span>
        </div>
        <div className="absolute -bottom-4 -right-4 opacity-10 italic">
            <TrendingUp size={120} strokeWidth={4} />
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 italic text-center">
        <Link href="/app/savings" className="neo-button bg-white text-xs h-14 normal-case italic flex items-center justify-center">
            <Plus size={16} className="mr-2 italic" strokeWidth={3} /> Add Funds
        </Link>
        <Link href="/app/savings" className="neo-button bg-white text-xs h-14 normal-case italic flex items-center justify-center">
            <ArrowUpRight size={16} className="mr-2 italic" strokeWidth={3} /> Withdraw
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 italic text-left">
        <Link href="/app/credit" className="bg-card-1 neo-brutal p-4 flex flex-col justify-between h-32 group cursor-pointer italic text-left">
          <div className="italic text-left">
            <div className="text-[9px] font-black uppercase tracking-widest opacity-60 italic text-left italic">Credit Line</div>
            <div className="text-xl font-black italic text-left italic">${(walletData?.creditLimit ?? 500).toFixed(0)}</div>
          </div>
          <div className="flex justify-between items-center italic text-left">
            <span className="text-[8px] font-black uppercase opacity-40 italic text-left italic">Available</span>
            <div className="w-6 h-6 bg-white border-2 border-border-black rounded-lg flex items-center justify-center group-hover:bg-accent transition-colors italic">
                <ArrowUpRight size={12} strokeWidth={4} />
            </div>
          </div>
        </Link>

        <Link href="/app/credit" className="bg-card-2 neo-brutal p-4 flex flex-col justify-between h-32 group cursor-pointer italic text-left">
          <div className="italic text-left">
            <div className="text-[9px] font-black uppercase tracking-widest opacity-60 italic text-left italic">Active BNPLs</div>
            <div className="text-xl font-black italic text-left italic">Manage</div>
          </div>
          <div className="flex justify-between items-center italic text-left">
            <span className="text-[8px] font-black uppercase opacity-40 italic text-left italic">Track</span>
            <div className="w-6 h-6 bg-white border-2 border-border-black rounded-lg flex items-center justify-center group-hover:bg-accent transition-colors italic">
                <ArrowUpRight size={12} strokeWidth={4} />
            </div>
          </div>
        </Link>
      </div>

      {/* Activity List */}
      <div className="space-y-4 italic text-left">
        <h2 className="text-xl font-black uppercase italic tracking-tight text-left italic">Recent Activity</h2>
        <div className="space-y-0 border-y-2 border-border-black/10 italic text-left">
          <ActivityItem 
            icon="🛍" 
            label="Example Order" 
            amount="-$33.00" 
            type="BNPL Pay"
          />
          <ActivityItem 
            icon="📈" 
            label="Yield Accrual" 
            amount="+$0.42" 
            type="Earnings"
          />
          <ActivityItem 
            icon="💰" 
            label="USDT Deposit" 
            amount="+$100.00" 
            type="Transfer"
          />
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ icon, label, amount, type }: any) {
    return (
        <div className="flex items-center justify-between py-4 group cursor-pointer hover:bg-white/40 transition-colors px-2 -mx-2 italic text-left">
            <div className="flex items-center gap-4 italic text-left">
                <div className="text-2xl w-10 h-10 bg-white border-2 border-border-black rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform italic text-center">
                    {icon}
                </div>
                <div className="italic text-left">
                    <div className="text-sm font-black italic uppercase leading-none text-left italic">{label}</div>
                    <div className="text-[9px] font-bold uppercase opacity-40 mt-1 text-left italic">{type}</div>
                </div>
            </div>
            <div className="text-right italic text-right">
                <div className={clsx(
                    "text-sm font-black italic text-right italic",
                    amount.startsWith('+') ? "text-[#00B894]" : "text-text"
                )}>
                    {amount}
                </div>
                <div className="text-[8px] font-bold uppercase opacity-30 text-right italic">Today</div>
            </div>
        </div>
    );
}
