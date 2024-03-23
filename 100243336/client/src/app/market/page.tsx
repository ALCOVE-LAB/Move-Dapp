"use client";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from "@/components/AptosClient";
import { HexInput } from "@aptos-labs/ts-sdk";
import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Button, Spin, List, Checkbox, Input } from "antd";
import { contract_address } from "@/config/contract_config";

export default function Account() {
    const { account, signAndSubmitTransaction } = useWallet();
    const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
    const address = account?.address;
    const [balance, setBalance] = useState(0);
    const [car_number, setCarNumber] = useState("")

    const onNftMint = async () => {
        if (!account) return [];
        setTransactionInProgress(true);
        // build a transaction payload to be submited
        try {
            // sign and submit transaction to chain
            const response = await signAndSubmitTransaction({
                // @ts-ignore
                data: {
                    function: `${contract_address}::nft::buy_parkng_slot_entry`,
                    typeArguments: [],
                    functionArguments: [contract_address, car_number],
                },
            });
            // wait for transaction
            await AptosClient.waitForTransaction(response.hash);
        } catch (error: any) {
            console.log(error);
        } finally {
            setTransactionInProgress(false);
        }
    }

    return (
        <>
            <div>input car number</div>
            <Input value={car_number} onChange={(e) => setCarNumber(e.target.value)}></Input>
            <Button
                onClick={onNftMint}
                type="primary"
                style={{ height: "40px", backgroundColor: "#3f67ff" }}
            >
                Buy Parking Slot
            </Button>
        </>
    )
}