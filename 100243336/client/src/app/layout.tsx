"use client";
import "./globals.css";

import { Inter } from "next/font/google";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

import SideNavigation from "@/components/SideNavigation";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

const inter = Inter({ subsets: ["latin"] });
const wallets = [new PetraWallet()];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
    >
      <html lang="en">
        <body className={inter.className}>
          <SideNavigation />
          <div className="absolute right-5">
            <WalletSelector />
          </div>
          <div className="absolute left-60 p-20">
            {children}
          </div>
        </body>
      </html>
    </AptosWalletAdapterProvider>
  );
}
