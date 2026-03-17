'use client';

import { motion } from 'framer-motion';
import { ScrollText, Loader2, Clock } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const ACTION_MAP: any = {
  credit_scored: { emoji: '🧠', color: 'bg-accent' },
  collateral_deposited: { emoji: '🔐', color: 'bg-primary' },
  collateral_redeemed: { emoji: '💸', color: 'bg-card-2' },
  installment_paid: { emoji: '✅', color: 'bg-secondary' },
  yield_harvested: { emoji: '🌾', color: 'bg-card-1' },
  order_completed: { emoji: '🎉', color: 'bg-accent' },
  order_defaulted: { emoji: '⚠️', color: 'bg-card-1' },
};

export default function ActivityPage() {
  const { address } = useWallet();
  const logs = useQuery(api.agent.getAgentLogs, { walletAddress: address ?? "" });

  return (
    <div className="p-6 space-y-6 italic text-left font-archivo">
      <h1 className="text-3xl font-black italic tracking-tighter text-left">🤖 Agent Activity</h1>

      {!logs ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
              <Loader2 className="animate-spin" size={48} />
              <p className="text-[10px] font-black uppercase">Fetching Logs...</p>
          </div>
      ) : logs.length === 0 ? (
          <div className="neo-card p-12 text-center space-y-6 italic">
              <div className="text-8xl">🤖</div>
              <div className="space-y-1 italic text-center">
                  <h3 className="text-xl font-black uppercase italic text-center">No activity yet</h3>
                  <p className="text-[10px] font-bold uppercase opacity-40 italic text-center">Start a BNPL order to see the agent in action.</p>
              </div>
          </div>
      ) : (
          <div className="space-y-4 italic">
              {logs.map((log, i) => {
                  const meta = ACTION_MAP[log.action] || { emoji: '⚙️', color: 'bg-white' };
                  const timeAgo = Math.floor((Date.now() - log.createdAt) / 60000);
                  
                  return (
                      <motion.div
                        key={log._id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="neo-brutal bg-white overflow-hidden flex flex-col italic"
                      >
                          <div className="p-4 flex gap-4 italic items-start">
                              <div className={`w-10 h-10 ${meta.color} border-2 border-border-black rounded-xl flex items-center justify-center text-xl shrink-0 italic`}>
                                  {meta.emoji}
                              </div>
                              <div className="flex-1 space-y-1 italic text-left">
                                  <div className="flex justify-between items-start italic">
                                      <p className="text-[10px] font-black uppercase italic text-left">{log.action.replace('_', ' ')}</p>
                                      <div className="flex items-center gap-1 opacity-40 italic">
                                          <Clock size={10} />
                                          <span className="text-[8px] font-bold uppercase italic">{timeAgo < 1 ? 'Just now' : `${timeAgo}m ago`}</span>
                                      </div>
                                  </div>
                                  <p className="text-[11px] font-bold leading-tight italic text-left">{log.details}</p>
                              </div>
                          </div>
                          
                          <div className={`h-2 w-full border-t-2 border-border-black ${log.success ? 'bg-secondary' : 'bg-card-1'}`} />
                          
                          {log.txHash && (
                              <div className="px-4 py-2 bg-zinc-50 border-t-2 border-border-black flex justify-between items-center italic">
                                  <span className="text-[8px] font-mono opacity-40 truncate italic text-left">TX: {log.txHash}</span>
                                  <ExternalLink size={10} className="opacity-40" />
                              </div>
                          )}
                      </motion.div>
                  );
              })}
          </div>
      )}
    </div>
  );
}

function ExternalLink(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
    )
}
