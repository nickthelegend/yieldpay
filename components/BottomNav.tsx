'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const IS_FORK = process.env.NEXT_PUBLIC_USE_FORK === 'true';

const TABS = [
  { id: 'home', label: 'Home', icon: '🏠', path: '/app' },
  { id: 'credit', label: 'Credit', icon: '💳', path: '/app/credit' },
  { id: 'savings', label: 'Savings', icon: '📈', path: '/app/savings' },
  { id: 'shop', label: 'Shop', icon: '🛍', path: '/app/checkout' },
  { id: 'activity', label: 'Agent', icon: '🤖', path: '/app/activity' },
];

if (IS_FORK) {
  TABS.push({ id: 'dev', label: 'Dev', icon: '🛠', path: '/app/dev-tools' });
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[72px] bg-border-black flex items-center justify-around px-1 z-50">
      {TABS.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <button
            key={tab.id}
            onClick={() => router.push(tab.path)}
            className="relative flex flex-col items-center justify-center py-2 transition-all duration-200 flex-1 min-w-0"
          >
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-x-1 inset-y-1 bg-accent rounded-full border-2 border-border-black"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 text-lg">{tab.icon}</span>
            <span className={clsx(
              "relative z-10 text-[6px] sm:text-[7px] uppercase font-black tracking-tighter sm:tracking-widest mt-0.5 truncate",
              isActive ? "text-text" : "text-white/50"
            )}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
