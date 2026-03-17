import type { Metadata } from "next";
import { Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/hooks/useWallet";
import { ToastProvider } from "@/components/Toast";
import { ConvexClientProvider } from "./ConvexClientProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["800"],
});

export const metadata: Metadata = {
  title: "YieldPay | The Future of Pay Later",
  description: "Lock USDT. Earn yield. Buy now, pay never stress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${syne.variable} antialiased font-space`}>
        <ConvexClientProvider>
          <WalletProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </WalletProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
