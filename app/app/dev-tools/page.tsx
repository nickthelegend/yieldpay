'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2, RefreshCcw, FastForward, Wallet, Zap } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function DevToolsPage() {
  const { address, isConnected, refresh, usdtBalance, ethBalance, yoShares, yoUsdtValue } = useWallet();
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  if (process.env.NEXT_PUBLIC_USE_FORK !== 'true') {
    redirect('/app');
  }

  const handleAction = async (name: string, endpoint: string, body: any) => {
    setLoading(name);
    setStatus(null);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        setStatus(`✅ ${data.message}`);
        await refresh();
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch (e: any) {
      setStatus(`❌ ${e.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6 text-left">
      <h1 className="text-3xl font-black tracking-tighter">Dev Tools</h1>
      
      <div className="bg-[#FFD93D] border-2 border-border-black p-4 flex items-center gap-3 ">
        <AlertTriangle className="shrink-0" />
        <p className="text-[10px] font-black uppercase leading-tight">
          Fork mode active. Running on Anvil localhost:8545
        </p>
      </div>

      {isConnected ? (
        <div className="space-y-6">
          <div className="neo-card bg-white space-y-2 text-left">
            <p className="text-[10px] font-black uppercase opacity-40 text-left">Connected Target</p>
            <p className="text-xs font-black break-all text-left ">{address}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
              <BalanceBox label="USDT" value={usdtBalance.toFixed(2)} />
              <BalanceBox label="ETH" value={ethBalance.toFixed(4)} />
              <BalanceBox label="yoShares" value={Number(yoShares).toString()} />
              <BalanceBox label="yoValue" value={yoUsdtValue.toFixed(2)} />
          </div>

          <div className="space-y-3 text-left">
            <DevButton 
              label="Seed 10,000 USDT from Whale" 
              icon={Zap}
              loading={loading === 'seed'}
              onClick={() => handleAction('seed', '/api/dev/seed', { address })}
            />
            <DevButton 
              label="Fast Forward 30 Days" 
              icon={FastForward}
              loading={loading === 'warp'}
              onClick={() => handleAction('warp', '/api/dev/warp', { seconds: 2592000 })}
            />
            <DevButton 
              label="Check Balances" 
              icon={RefreshCcw}
              loading={loading === 'refresh'}
              onClick={async () => {
                  setLoading('refresh');
                  await refresh();
                  setLoading(null);
                  setStatus('✅ Balances updated');
              }}
            />
          </div>

          {status && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-border-black p-3 rounded-xl text-[10px] font-black uppercase "
              >
                  {status}
              </motion.div>
          )}
        </div>
      ) : (
        <div className="neo-card bg-white p-8 text-center ">
            <p className="text-sm font-black uppercase opacity-40 ">Connect wallet to use dev tools</p>
        </div>
      )}
    </div>
  );
}

function BalanceBox({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-zinc-100 border-2 border-border-black p-3 text-left">
            <p className="text-[8px] font-black uppercase opacity-40 text-left ">{label}</p>
            <p className="text-sm font-black text-left ">{value}</p>
        </div>
    );
}

function DevButton({ label, icon: Icon, loading, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            disabled={loading}
            className="neo-button w-full h-14 bg-white text-xs normal-case gap-3 "
        >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Icon size={18} />}
            {label}
        </button>
    );
}
