'use client';

export function Skeleton({ width = '100%', height = '24px' }: { width?: string, height?: string }) {
  return (
    <div 
      style={{ width, height }} 
      className="bg-[#e0d4c4] border-2 border-[#1A1A1A] rounded-lg animate-pulse" 
    />
  );
}
