'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-text overflow-x-hidden">
      {/* Navbar */}
      <nav className="h-[80px] border-b-[3px] border-border-black bg-white flex items-center justify-between px-10">
        <h1 className="text-3xl font-black italic tracking-tighter">YieldPay</h1>
        <div className="flex gap-4">
          <Link href="/app" className="neo-button bg-accent text-sm py-2">Launch App →</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row items-center justify-center px-10 py-20 gap-16 lg:gap-32">
        <div className="flex-1 space-y-8 max-w-2xl">
          <div className="relative inline-block">
            <h1 className="text-[64px] md:text-[96px] leading-[0.9] font-black uppercase italic mb-4">
              The Future of Pay Later is Here
            </h1>
            <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 400 12" fill="none">
              <path d="M4 8C45.5 2.5 124 -2 200 4.5C276 11 354.5 10 396 6" stroke="#FF6B35" strokeWidth="8" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-xl md:text-2xl font-semibold opacity-80 leading-relaxed max-w-lg text-left">
            Lock USDT. Earn yield. Buy now, pay never stress.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/app" className="neo-button bg-border-black text-white text-lg px-10 h-16">
              Launch App →
            </Link>
            <button className="neo-button bg-white text-lg px-10 h-16">
              Read Docs
            </button>
          </div>
        </div>

        {/* CSS Mockup */}
        <div className="relative shrink-0">
          <div className="w-[300px] h-[600px] md:w-[350px] md:h-[700px] bg-background border-[6px] border-border-black rounded-[40px] shadow-[12px_12px_0px_#1A1A1A] overflow-hidden flex flex-col p-4 gap-4">
            <div className="h-8 w-1/2 bg-border-black/10 rounded-full" />
            <div className="h-32 w-full bg-accent border-[3px] border-border-black rounded-2xl p-4 flex flex-col justify-between">
              <div className="h-3 w-1/3 bg-border-black/20 rounded-full" />
              <div className="h-8 w-2/3 bg-border-black/20 rounded-full" />
            </div>
            <div className="flex gap-4">
              <div className="h-12 flex-1 bg-white border-[3px] border-border-black rounded-xl" />
              <div className="h-12 flex-1 bg-white border-[3px] border-border-black rounded-xl" />
            </div>
            <div className="flex-1 bg-white border-[3px] border-border-black rounded-2xl" />
          </div>
          
          {/* Emojis */}
          <div className="absolute top-10 -left-10 text-6xl float-emoji" style={{ animationDelay: '0s' }}>💰</div>
          <div className="absolute top-1/2 -right-12 text-6xl float-emoji" style={{ animationDelay: '0.5s' }}>⚡️</div>
          <div className="absolute -bottom-8 left-10 text-6xl float-emoji" style={{ animationDelay: '1s' }}>🎯</div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary py-32 px-10 border-t-[3px] border-border-black">
        <h2 className="text-5xl font-black uppercase text-center mb-20 italic underline decoration-white decoration-8">How it works</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <HowCard 
            icon="🔐"
            step="01"
            title="Lock Collateral"
            desc="Deposit USDT via Tether WDK wallet securely."
          />
          <HowCard 
            icon="📈"
            step="02"
            title="Earn While You Wait"
            desc="Collateral earns ~16% APR via YO Protocol vaults."
          />
          <HowCard 
            icon="🛍"
            step="03"
            title="Buy Now Pay Later"
            desc="Get approved instantly. Pay in 3. Stress-free."
          />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-32 px-10 border-t-[3px] border-border-black text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
          <Stat text="$75M+" label="Total Deposits" />
          <Stat text="16.9%" label="Current APR" />
          <Stat text="3-Click" label="Checkout" />
        </div>
        <div className="mt-24 flex flex-col items-center gap-8 text-center">
          <div className="flex gap-3">
            <span className="bg-white/20 border-2 border-white px-4 py-1 text-[10px] font-black uppercase rounded-full tracking-widest">Built on YO Protocol</span>
            <span className="bg-white/20 border-2 border-white px-4 py-1 text-[10px] font-black uppercase rounded-full tracking-widest">Tether WDK</span>
          </div>
          <Link href="/app" className="neo-button bg-border-black text-white text-xl px-12 h-20">
            Start Earning →
          </Link>
        </div>
      </section>

      {/* Integration Badges */}
      <section className="bg-border-black py-32 px-10 border-t-[3px] border-border-black text-white">
        <h2 className="text-5xl font-black uppercase text-center mb-20 italic">Built With</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            <BadgeCard 
                title="Tether WDK" 
                desc="Self-custodial wallets" 
                bg="bg-primary" 
            />
            <BadgeCard 
                title="YO Protocol" 
                desc="16.9% APR yield engine" 
                bg="bg-secondary" 
            />
            <BadgeCard 
                title="Ethereum" 
                desc="Secure L1 settlement" 
                bg="bg-card-2" 
            />
            <BadgeCard 
                title="USDT" 
                desc="Stablecoin payments" 
                bg="bg-accent" 
            />
        </div>
      </section>
    </div>
  );
}

function BadgeCard({ title, desc, bg }: any) {
    return (
        <motion.div 
            whileHover={{ borderColor: '#FFD93D', boxShadow: '4px 4px 0px #FFD93D', y: -5 }}
            className={`p-6 border-3 border-white shadow-[4px_4px_0_0_#FFF] rounded-2xl flex flex-col gap-2 transition-all ${bg}`}
        >
            <p className="text-lg font-black uppercase italic leading-none text-[#1A1A1A]">{title}</p>
            <p className="text-[10px] font-bold uppercase opacity-60 text-[#1A1A1A]">{desc}</p>
        </motion.div>
    );
}

function HowCard({ icon, step, title, desc }: any) {
  return (
    <motion.div 
      whileHover={{ y: -10, rotate: 1 }}
      className="bg-white neo-brutal p-8 space-y-4 text-left"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <div className="text-sm font-black text-[#FF6B35] uppercase tracking-[4px]">Step {step}</div>
      <h3 className="text-2xl uppercase italic">{title}</h3>
      <p className="text-base font-semibold opacity-60 leading-relaxed text-left">{desc}</p>
    </motion.div>
  );
}

function Stat({ text, label }: any) {
  return (
    <div className="text-center space-y-2">
      <div className="text-7xl font-black italic tracking-tighter text-white">{text}</div>
      <div className="text-sm font-black uppercase tracking-[6px] opacity-70 text-white">{label}</div>
    </div>
  );
}
