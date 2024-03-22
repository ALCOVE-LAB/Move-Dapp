import {Aptos, AptosConfig, Network} from "@aptos-labs/ts-sdk";
import {Wallet} from '@aptos-labs/wallet-adapter-core';
import {PetraWallet} from 'petra-plugin-wallet-adapter';

//DApp支持钱包： https://https://github.com/aptos-labs/aptos-wallet-adapter
export const wallets: Wallet[] = [new PetraWallet()];

//初始化Aptos客户端
export const aptosClient = new Aptos(
	new AptosConfig({ network: Network.DEVNET })
);
