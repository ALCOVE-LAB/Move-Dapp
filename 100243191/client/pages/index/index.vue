<template>
	<view class="content">
		<view class="top">
			<view class="top-middle">Lucky Pocket</view>
			<view class="wallet" v-if="address" >
				<image class="wallet-icon" :src="walletCore.wallet.icon" />
				<view v-if="address">
					<text>{{address?.substring(0,5) + "..." + address?.slice(-4)}}</text>
					<view><text>{{BigNumber(balance).shiftedBy(-8)}}APT</text></view>
				</view>
				<text v-if='usingWallet != walletCore.wallet.name'>Click to Connect</text>
				<button class="quit-btn" @click="disconnectHandler" v-if="address"><i class='fa fa-power-off'></i></button>
			</view>
		</view>
	</view>
	<view class="game-desc">
		<view class="line1">
			Pay 0.01 APT check your luck, get up to 0.05 APT PRIZE!
		</view>
		<view class="line2">
			The prize pool will be emptied every 5 purchases, and the amount will be divided according to your luck.
		</view>
	</view>
	<view class="app">
		<view class="wallet" v-if="!address" v-for="wallet in wallets" :key="wallet.name" @click="walletCore.connect(wallet.name)" >
			<image class="wallet-icon" :src="wallet.icon" />
			<view v-if="address">
				<text>{{address?.substring(0,5) + "..." + address?.slice(-4)}}</text>
				<view><text>{{BigNumber(balance).shiftedBy(-8)}}APT</text></view>
			</view>
			<text v-if='usingWallet != wallet.name'>Click to Connect</text>
			<button class="quit-btn" @click="disconnectHandler" v-if="address"><i class='fa fa-power-off'></i></button>
		</view>
		<button v-if="address" class="lucky-btn" @click="createCollectionHandler" >
			<i class="fas fa-spinner" v-if="ccreating" />I'm Feeling Lucky!
		</button>
	</view>
</template>

<script lang="ts" setup>
	import { ref, watch } from "vue";
	import {wallets, aptosClient} from "@/config";
	import {InputTransactionData, WalletCore} from '@aptos-labs/wallet-adapter-core';
	import BigNumber from 'bignumber.js';
	import { APTOS_COIN, HexInput } from "@aptos-labs/ts-sdk";
	
	const address = ref();
	const balance = ref(0);
	const targetAddress = ref('');
	const walletCore = new WalletCore(wallets);
	var usingWallet = ref('');
	const autoConnect = ref(true);
	const connecting = ref(false);
	const WALLET_NAME = 'AptosWalletName';
	
	
	const disconnectHandler = () => {
		walletCore.disconnect();
		targetAddress.value = '';
	}
	
	//==============监听=============
	//监听账户变更
	walletCore.on('accountChange', ()=>{
		address.value = walletCore.account?.address;
		console.log(`account changed to:${walletCore.account?.address}`)
	});
	
	//监听连接
	walletCore.on('connect', ()=>{
		window.localStorage.setItem(WALLET_NAME, walletCore.wallet?.name || '');
		address.value = walletCore.account?.address;
		usingWallet.value = walletCore.wallet?.name as string;
		console.log("connected... ", walletCore.wallet?.name as string);
		fetchBalance();
	});
	//监听断开
	walletCore.on('disconnect', ()=>{
		address.value = undefined;
		balance.value = 0;
		console.log("disconnected...",walletCore.wallet?.name);
		usingWallet.value = "";
	});
	
	//=================余额=============
	const fetchBalance = async () => {
		if (address.value){
			try{
				balance.value = await aptosClient.getAccountCoinAmount({
					accountAddress: address.value as HexInput,
					coinType: APTOS_COIN,
				});
				console.log('balance:', balance.value);
			}catch(error){
				balance.value = 0;
			}
		}else {
			balance.value = 0;
		}
	};
	
	if(autoConnect){
		setTimeout(async() => {
			if(window.localStorage.getItem(WALLET_NAME)) {
				try{
					connecting.value = true;
					await walletCore.connect(window.localStorage.getItem(WALLET_NAME) as string);
					address.value = walletCore.account?.address;
				}catch(e: any){
					console.log(e);
				}finally {
					connecting.value = false;
				}
			}else {
				connecting.value = false;
			}
		}, 1000);
	}
	
	//===============create collection-================
	const ccreating = ref(false);
	const createCollectionHandler = async () =>{
		if(ccreating.value) return;
		const transaction: InputTransactionData = {
			data: {
			//ContractAddress::ModuleName::FunctionName
			function: '0xe5f0f7b013d61192fd53c20b4278781ee447562e01e67dae400132f69df014e1::luck_pocket::toss',
			functionArguments: [],
			},
		};
		
		try{
			ccreating.value = true;
			const response = await walletCore.signAndSubmitTransaction(transaction);
			console.log('Collection Creating Transaction Response:', response);
			await aptosClient.waitForTransaction({transactionHash: response.hash,});
			console.log(`交易成功: https://explorer.aptoslabs.com/txn/${response.hash}?network=DEVNET`)
		}catch (err){
			console.log(err);
		}finally {
			ccreating.value = false;
		}
	};
	
</script>

<style>
	.content{
		display: flex;
		justify-content: center;
	}
	.top{
		width: 100%;
		height: 60px;
		display: flex;
		justify-content: space-between;
		.top-middle{
			flex:1;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 25px;
			font-family: fantasy;
		}
		.wallet{
			position: absolute;
			    right: 0;
		}
	}
	.game-desc{
		margin-top: 20px;
		margin-left: 10px;
		.line1{
			font-size: 28px;
		}
		.line2{
			color: #8e8e8e;
		}
	}
	.app {
		margin-top: 20px;
		display: flex;	
		justify-content: center;
	}
	.wallet {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid #d1d1d1;
		width: 250px;
		height: 60px;
		border-radius: 10px;
		background-color: aquamarine;
		color: #989898;
		.wallet-icon {
			width: 30px;
			height: 30px;
			border-radius: 50%;
			margin: 5px;
		}
	}
	.lucky-btn {
		width: 230px;
		height: 230px;
		background-color: #55aa00;
		color: #fff;
		font-size: 20px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	input {
		border: 1px solid #d1d1d1;
	}
</style>
