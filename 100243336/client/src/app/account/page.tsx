"use client";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from "@/components/AptosClient";
import { HexInput } from "@aptos-labs/ts-sdk";
import React, { useEffect, useState } from 'react';

export default function Account() {
    const { account, signAndSubmitTransaction } = useWallet();
    const address = account?.address;
    const [balance, setBalance] = useState(0);
    useEffect(() => {
        const fetchData = async () => {
            if (address) {
                try {
                    const x = await AptosClient.getAccountAPTAmount({ accountAddress: address as HexInput });
                    setBalance(x);
                } catch (error) {
                    setBalance(0);
                }
            }
        };
        const fetchNft = async () => {
            if (address) {
                try {
                    const todoListResource = await AptosClient.getAccountOwnedTokens({
                        accountAddress: account?.address,
                        // resourceType: "0x1::object::Object<0x4::aptos_token::AptosToken>",
                        options: {
                            tokenStandard: "v2",
                            pagination: { offset: 0, limit: 10 },
                            orderBy: [{ last_transaction_version: "desc" }],
                        },                    
                    });
                    console.log(todoListResource);
                } catch (error) {
                    console.log(error);
                }
            }
        };

        fetchData();
        fetchNft();
    }, [account]);

    return (
        <>
            <div>account address: {address}</div>
            <div>account balance: {balance}</div>
        </>
    )
}

