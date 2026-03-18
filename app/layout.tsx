import type { Metadata } from "next";
import { Archivo, Public_Sans } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/hooks/useWallet";
import { ToastProvider } from "@/components/Toast";
import { ConvexClientProvider } from "./ConvexClientProvider";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["900"],
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "700", "900"],
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
      <body className={`${publicSans.variable} ${archivo.variable} antialiased font-body`}>
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
