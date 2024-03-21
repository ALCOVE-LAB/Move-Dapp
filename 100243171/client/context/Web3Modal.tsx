'use client';
import React from "react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
const wallets = [new PetraWallet()];


export function Web3Modal({ children }: { children: React.ReactNode }) {
    return (<>
        <div>
            <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
                {children}
            </AptosWalletAdapterProvider>
        </div>
    </>)
}
