import { MobileFrame } from '@/components/MobileFrame';
import { BottomNav } from '@/components/BottomNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileFrame>
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-[80px]">
        {children}
      </div>
      <BottomNav />
    </MobileFrame>
  );
}
