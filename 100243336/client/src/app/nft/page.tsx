"use client";
import Image from 'next/image';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from "@/components/AptosClient";
import { HexInput } from "@aptos-labs/ts-sdk";
import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Button, Spin, List, Checkbox, Input } from "antd";
import { contract_address } from '@/config/contract_config';
import { NotFoundBoundary } from 'next/dist/client/components/not-found-boundary';

interface Nft {
    id: string;
    name: string;
    url: string;
    car_number: string;
}

export default function Account() {
    const { account, signAndSubmitTransaction } = useWallet();
    const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
    const address = account?.address;
    const [balance, setBalance] = useState(0);

    // const token_urls: string[] = [];
    // const [token_urls_state, setTokenUrlsState] = useState([]);
    // const token_names: string[] = [];
    // const [token_names_state, setTokenNamesState] = useState([]);
    // const car_numbers: string[] = [];
    // const [car_numbers_state, setCarNumbers] = useState([]);
    // const token_ids: string[] = [];
    // const [token_ids_state, setTokenIdsState] = useState([]);
    const [nft_state, setNftState] = useState<Nft[]>([]);

    const [input_car_number, setInputCarNumber] = useState("");
    const nfts: Nft[] = [];

    useEffect(() => {
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
                    console.log(todoListResource[0]);
                    nfts.length = 0;
                    todoListResource?.forEach((item) => {
                        nfts.push({
                            id: item.current_token_data?.token_data_id,
                            name: item.current_token_data?.token_name,
                            url: item.current_token_data?.token_uri,
                            car_number: item.current_token_data?.token_properties?.car_number,
                        })
                    });
                    nfts.sort((a, b) => a.name.localeCompare(b.name));
                    setNftState(nfts);
                    // setTokenUrlsState(token_urls);
                    // setTokenNamesState(token_names);
                    // setCarNumbers(car_numbers);
                    // setTokenIdsState(token_ids);
                } catch (error) {
                    console.log(error);
                }
            }
        };
        fetchNft();
    }, [account, input_car_number]);

    const onChangeCarNumber = async (token_id: string, car_number: string) => {
        if (!account) return [];
        setTransactionInProgress(true);
        // build a transaction payload to be submited
        try {
            // sign and submit transaction to chain
            const response = await signAndSubmitTransaction({
                // @ts-ignore
                data: {
                    function: `${contract_address}::nft::change_car_number`,
                    typeArguments: [],
                    functionArguments: [contract_address, token_id, car_number],
                },
            });
            // wait for transaction
            // await AptosClient.waitForTransaction(response.hash);
            setInputCarNumber("");
        } catch (error: any) {
            console.log(error);
        } finally {
            setTransactionInProgress(false);
        }
    }

    return (
        <>
            <div>
                {
                    nft_state.map((nft_object) => (
                        <div>
                            <p>car number: {nft_object.car_number}</p>
                            <div>change car number</div>
                            <Input onChange={(e) => setInputCarNumber(e.target.value)}></Input>
                            <Button
                                onClick={() => onChangeCarNumber(nft_object.id, input_car_number)}
                                type="primary"
                                style={{ height: "40px", backgroundColor: "#3f67ff" }}
                            >
                                Change Car Number
                            </Button>
                            <div></div>
                            <Image src={nft_object.url} alt={nft_object.id} width={300} height={300} />

                            <div></div>
                        </div>
                    ))
                }
            </div>
        </>

    )
}

