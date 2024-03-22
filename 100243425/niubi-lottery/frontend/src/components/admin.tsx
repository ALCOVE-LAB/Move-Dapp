import React, {useCallback, useEffect, useState} from 'react';
import {ABI} from "../abi";
import {aptos, provider} from "../utils/consts";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useAlert} from "../hooks/alertProvider";
import {Event, LotteryResult, LotteryResults, MintEvent, RawTicket, Task} from "../utils/types";
import {GraphqlQuery} from "@aptos-labs/ts-sdk";

export default function Admin() {

    const { account, network, signAndSubmitTransaction } = useWallet();
    function splitString(str: string): [string, string] {
        const parts = str.split(';');
        const secondPart = parts[parts.length - 1];
        const firstPart = parts.slice(0, parts.length - 1).join(';');
        return [firstPart, secondPart];
    }
    const [mintEvents, setMintEvents] = useState<MintEvent[]>([]);
    const [lotteryResult, setLotteryResult] = useState<LotteryResult>();


    const fetchList = useCallback(async () => {
        if (!account) return [];
        try {
            let query: GraphqlQuery = {
                query: "query MyQuery {\n" +
                    "  events(\n" +
                    "    where: {indexed_type: {_eq: \"" + ABI.address  + "::lottery::MintEvent\"}}\n" +
                    "  ) {\n" +
                    "    data\n" +
                    "  }\n" +
                    "}\n",
                variables: {}
            }
            const res = await aptos.queryIndexer<Event>({query: query})
            if (!!res && res.events) {
                setMintEvents(res.events)
            }
            console.log(res.events)

        } catch (e: any) {
        }
    }, [account]);

    useEffect(() => {
        fetchList();
    }, [account?.address, fetchList]);
    const doLottery = async () => {
        if (!account) return;
        try {
            // sign and submit transaction to chain
            const response = await signAndSubmitTransaction({
                type: "entry_function_payload",
                function: `${ABI.address}::lottery::public_do_lottery`,
                type_arguments: [],
                arguments: [],
            });
            // wait for transaction
            await provider.waitForTransaction(response.hash);
            // setSuccessAlertHash(response.hash, network?.name);
            await getLastResult()
        } catch (error: any) {
            console.log("error", error);
        } finally {
        }
    };
    const getLastResult = async () => {
        try {
            const lotteryResults: LotteryResults = await aptos.getAccountResource({
                accountAddress: ABI.address,
                resourceType: `${ABI.address}::lottery::LotteryResults`,
            });

            if (lotteryResults.history.length !=0) {
                setLotteryResult(lotteryResults.history[lotteryResults.history.length - 1])
            }
            // setTasks(purchasedTickets.tickets as Task[]);
        } catch (e: any) {
          console.log(e)
        }
    }

    function displayableRed(str: string) {
        let red: number[] = [];
        for (let i = 1; i <= 6; i++) {
            let num = str.slice(i*2, (i+1)*2)
            red.push(parseInt(num, 16))
        }
        red.sort((a, b) => a -b);
        return red.join(";")
    }

    return (
        <div className="content-container">
            <h2>管理员魔法</h2>
            <button onClick={doLottery}>开奖</button>

            <br/>
            <h2>开奖信息</h2>
            <div>
                {lotteryResult && <div >
                    <div className="bet-history-container">
                        <div className="bet-record">
                            <p>红球：{displayableRed(lotteryResult.red)}</p>
                            <p>蓝球：{lotteryResult.blue}</p>
                            <p>开奖时间：{new Date(lotteryResult.timestamp / 1000).toLocaleString()}</p>
                        </div>
                    </div>
                </div>}
            </div>
            <h2>大伙们的投注历史记录：</h2>
            <div className="bet-history">

                <div className="bet-history-container">
                    {mintEvents.map((mintEvent) => (
                        <div className="bet-record">
                            <p>红球：{splitString(mintEvent.data.numeros)[0]}</p>
                            <p>蓝球：{splitString(mintEvent.data.numeros)[1]}</p>
                            <p>投注时间：{new Date(mintEvent.data.timestamp / 1000).toLocaleString()}</p>
                            <p>投注人：{mintEvent.data.owner}</p>
                        </div>))}
                </div>
            </div>
        </div>
    );
}