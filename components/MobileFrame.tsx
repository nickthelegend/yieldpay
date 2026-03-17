'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={clsx(
          "bg-background border-border-black overflow-hidden relative flex flex-col transition-all duration-300",
          "w-full h-screen sm:w-[390px] sm:h-[844px] sm:border-[6px] sm:rounded-[40px] sm:shadow-[12px_12px_0px_#1A1A1A]"
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}
