'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-text overflow-x-hidden">
      {/* Navbar */}
      <nav className="h-[80px] border-b-[4px] border-black bg-primary flex items-center justify-between px-10">
        <h1 className="text-3xl font-black tracking-tighter wiggle glitch">YieldPay</h1>
        <div className="flex gap-4">
          <Link href="/app" className="neo-button bg-accent text-sm py-2">Launch App →</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row items-center justify-center px-10 py-20 gap-16 lg:gap-32">
        <div className="flex-1 space-y-8 max-w-2xl">
          <div className="relative inline-block">
            <h1 className="text-[64px] md:text-[96px] leading-[0.9] font-black uppercase mb-4 strobe">
              The Future of Pay Later is Here
            </h1>
            <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 400 12" fill="none">
              <path d="M4 8C45.5 2.5 124 -2 200 4.5C276 11 354.5 10 396 6" stroke="#00FF00" strokeWidth="8" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-xl md:text-2xl font-black leading-relaxed max-w-lg text-left uppercase bg-accent inline-block p-2 border-2 border-black shadow-brutal">
            Lock USDT. Earn yield. Buy now, pay never stress.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/app" className="neo-button bg-black text-white text-lg px-10 h-16 wiggle">
              Launch App →
            </Link>
            <button className="neo-button bg-white text-lg px-10 h-16">
              Read Docs
            </button>
          </div>
        </div>

        {/* CSS Mockup */}
        <div className="relative shrink-0 tape">
          <div className="w-[300px] h-[600px] md:w-[350px] md:h-[700px] bg-secondary border-[8px] border-black rounded-none shadow-brutal-lg overflow-hidden flex flex-col p-4 gap-4 wiggle">
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
        <h2 className="text-5xl font-black uppercase text-center mb-20 underline decoration-white decoration-8">How it works</h2>
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
        <h2 className="text-5xl font-black uppercase text-center mb-20">Built With</h2>
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
      whileHover={{ borderColor: '#FFD93D', boxShadow: '8px 8px 0px #FFD93D', y: -10 }}
      className={`p-6 border-4 border-white shadow-[8px_8px_0_0_#FFF] rounded-none flex flex-col gap-2 transition-all ${bg}`}
    >
      <p className="text-xl font-black uppercase leading-none text-[#000000]">{title}</p>
      <p className="text-[12px] font-black uppercase opacity-80 text-[#000000]">{desc}</p>
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
      <div className="text-sm font-black text-black bg-primary inline-block px-2 py-1 mb-2">Step {step}</div>
      <h3 className="text-2xl uppercase">{title}</h3>
      <p className="text-base font-black leading-relaxed text-left">{desc}</p>
    </motion.div>
  );
}

function Stat({ text, label }: any) {
  return (
    <div className="text-center space-y-2 wiggle">
      <div className="text-7xl font-black tracking-tighter text-white">{text}</div>
      <div className="text-sm font-black uppercase tracking-[6px] opacity-100 text-white">{label}</div>
    </div>
  );
}
