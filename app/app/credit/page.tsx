'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Plus, ChevronRight, TrendingUp, CreditCard, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { useWallet } from '@/hooks/useWallet';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function CreditPage() {
  const router = useRouter();
  const { address, walletData } = useWallet();
  const orders = useQuery(api.orders.getOrdersByWallet, { walletAddress: address ?? "" });
  const creditHistory = useQuery(api.agent.getCreditHistory, { walletAddress: address ?? "" });

  const activeOrders = orders?.filter(o => o.status === "active") ?? [];
  const creditUsed = activeOrders.reduce((sum, o) => sum + o.collateralLocked, 0);
  const creditLimit = walletData?.creditLimit ?? 500;
  const creditScore = walletData?.creditScore ?? 650;
  const lastReason = creditHistory?.[0]?.reason ?? "Based on your on-chain wallet history";

  const progressPercent = Math.min(100, (creditUsed / creditLimit) * 100);

  return (
    <div className="bg-[#F5E6D3] min-h-full p-6 space-y-6 italic text-left font-archivo">
      {/* Header */}
      <button onClick={() => router.back()} className="w-10 h-10 bg-white border-2 border-border-black rounded-xl flex items-center justify-center neo-brutal-hover italic">
        <ArrowLeft size={20} />
      </button>

      <h1 className="text-4xl font-black italic tracking-tighter text-left">Credit Line</h1>

      {/* Credit Score Card */}
      <div className="bg-card-2 neo-brutal p-8 space-y-2 relative overflow-hidden italic text-center">
          <p className="text-[10px] font-black uppercase opacity-60 italic text-center">Credit Score</p>
          <h2 className="text-8xl font-black italic tracking-tighter text-center">{creditScore}</h2>
          <p className="text-[10px] font-bold uppercase opacity-40 italic text-center leading-tight">
            {lastReason}
          </p>
          <div className={clsx(
              "absolute top-4 right-4 border-2 border-border-black px-2 py-1 rounded-full text-[8px] font-black uppercase italic",
              creditScore > 700 ? "bg-secondary" : "bg-accent"
          )}>
              {creditScore > 700 ? "🟢 Excellent" : creditScore > 600 ? "🟡 Good" : "🔴 Poor"}
          </div>
      </div>

      {/* Available Credit */}
      <div className="bg-accent neo-brutal p-6 space-y-6 italic text-left">
          <div className="space-y-1 italic text-left">
            <p className="text-[10px] font-black uppercase opacity-60 italic text-left">Available Credit</p>
            <p className="text-5xl font-black italic text-left">${(creditLimit - creditUsed).toFixed(2)}</p>
          </div>
          
          <div className="space-y-2 italic text-left">
              <div className="h-6 bg-white border-3 border-border-black rounded-xl relative overflow-hidden italic text-left">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-primary border-r-3 border-border-black"
                  />
              </div>
              <p className="text-[9px] font-black uppercase opacity-40 italic text-left">
                ${creditUsed.toFixed(2)} used of ${creditLimit.toFixed(2)} limit
              </p>
          </div>
      </div>

      {/* Active Plans */}
      <div className="space-y-4 italic text-left">
          <h3 className="text-xl font-black uppercase italic tracking-tight text-left italic">Active Plans</h3>
          {!orders ? (
              <div className="flex justify-center p-8 opacity-20 italic">
                  <Loader2 className="animate-spin" />
              </div>
          ) : activeOrders.length === 0 ? (
              <div className="neo-card bg-white p-10 text-center space-y-4 italic border-dashed border-zinc-300">
                  <CreditCard size={32} className="mx-auto opacity-20" />
                  <p className="text-[10px] font-black uppercase opacity-40 italic text-center">No active BNPL plans found</p>
              </div>
          ) : (
              <div className="space-y-4 italic text-left">
                  {activeOrders.map((order, i) => (
                      <ActivePlanCard 
                        key={order._id}
                        icon={order.merchantEmoji}
                        name={order.merchantName}
                        amount={`$${order.installmentAmount.toFixed(2)}`}
                        due={order.nextPaymentDue ? new Date(order.nextPaymentDue).toLocaleDateString() : "TBD"}
                        progress={Array.from({ length: 3 }, (_, idx) => idx < order.installmentsPaid)}
                        color={i % 2 === 0 ? "bg-card-1" : "bg-secondary"}
                      />
                  ))}
              </div>
          )}
      </div>

      {/* Sticky Bottom CTA */}
      <div className="pt-4 italic">
          <button className="neo-button w-full h-16 bg-border-black text-white text-sm italic">
            + Request Credit Increase
          </button>
      </div>
    </div>
  );
}

function ActivePlanCard({ icon, name, amount, due, progress, color }: any) {
    return (
        <div className={clsx("neo-brutal p-4 flex flex-col gap-4 italic text-left", color)}>
            <div className="flex justify-between items-start italic text-left">
                <div className="flex items-center gap-3 italic text-left">
                    <div className="w-10 h-10 bg-white border-2 border-border-black rounded-xl flex items-center justify-center text-xl italic text-center">
                        {icon}
                    </div>
                    <p className="text-sm font-black uppercase italic text-left italic">{name}</p>
                </div>
                <div className="text-right italic text-right">
                    <p className="text-sm font-black italic text-right italic">{amount}</p>
                    <p className="text-[9px] font-bold uppercase opacity-40 italic text-right italic">Due {due}</p>
                </div>
            </div>
            <div className="flex gap-2 italic text-left italic">
                {progress.map((paid: boolean, i: number) => (
                    <div key={i} className={clsx(
                        "w-2 h-2 rounded-full border border-border-black italic text-left italic",
                        paid ? "bg-border-black" : "bg-white"
                    )} />
                ))}
            </div>
        </div>
    );
}
