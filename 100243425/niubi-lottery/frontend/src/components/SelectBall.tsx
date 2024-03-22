import React, { useState } from 'react';
import {ABI} from "../abi";
import {provider} from "../utils/consts";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useAlert} from "../hooks/alertProvider";
import {RawTicket, Task} from "../utils/types";

type SelectBallInputProps = {
    rawTickets: RawTicket[];
};
export default function SelectBall({
    rawTickets
                                   }: SelectBallInputProps) {
    const [redBalls, setRedBalls] = useState<number[]>([]);
    const [blueBall, setBlueBall] = useState<number>(0);
    const { account, network, signAndSubmitTransaction } = useWallet();
    const { setSuccessAlertHash } = useAlert();
    const redBallsOptions = [...Array(33).keys()].map((i) => i + 1);
    const blueBallsOptions = [...Array(16).keys()].map((i) => i + 1);

    const handleRedBallClick = (number: number) => {
        if (!redBalls.includes(number)) {
            if (redBalls.length < 6) {
                setRedBalls([...redBalls, number]);
            } else {
                alert('最多选择6个红色球');
            }
        } else {
            setRedBalls(redBalls.filter((n) => n !== number));
        }
    };

    const handleBlueBallClick = (number: number) => {
        if (blueBall !== null && blueBall !==0 && blueBall !=number) {
            alert('最多选择1个蓝色球');
        } else if (blueBall == number) {
            setBlueBall(0);
        } else {
            setBlueBall(number);
        }
    };

    const clearSelection = () => {
        setRedBalls([]);
        setBlueBall(0);
    };

    const confirmBet = () => {
        if (redBalls.length !== 6 || blueBall === null) {
            alert('请选择6个红球和1个蓝球');
            return;
        }
        onBuyTicket()
        console.log(`投注号码：红色球 ${redBalls.join(', ')}，蓝色球 ${blueBall}`);
    };

    const onBuyTicket = async () => {
        // check for connected account
        if (!account) return;
        // hold the latest task.task_id from our local state

        try {
            // sign and submit transaction to chain
            const response = await signAndSubmitTransaction({
                type: "entry_function_payload",
                function: `${ABI.address}::lottery::buy_ticket`,
                type_arguments: [],
                arguments: [redBalls.sort((a,b) => a - b).map((number) => number.toString() + ";"), blueBall.toString()],
            });
            // wait for transaction
            await provider.waitForTransaction(response.hash);
            let numeros = redBalls.sort((a,b) => a - b).map((number) => number.toString() + ";").join("") + blueBall.toString()
            rawTickets.push({
                numeros: numeros,
                timestamp: new Date().getTime() * 1000
            })
            clearSelection();
            // setSuccessAlertHash(response.hash, network?.name);
        } catch (error: any) {
            console.log("error", error);
        } finally {
        }
    };

    function splitString(str: string): [string, string] {
        const parts = str.split(';');
        const secondPart = parts[parts.length - 1];
        const firstPart = parts.slice(0, parts.length - 1).join(';');
        return [firstPart, secondPart];
    }

    return (
        <div className="content-container">
            <h2>牛逼双色球投注</h2>

            <div className="ball-container">
                {redBallsOptions.map((number) => (
                    <div
                        key={number}
                        className={`ball ${redBalls.includes(number) ? 'red-selected' : ''}`}
                        onClick={() => handleRedBallClick(number)}
                    >
                        {number}
                    </div>
                ))}
            </div>

            <div className="ball-container">
                {blueBallsOptions.map((number) => (
                    <div
                        key={number}
                        className={`ball ${blueBall === number ? 'blue-selected' : ''}`}
                        onClick={() => handleBlueBallClick(number)}
                    >
                        {number}
                    </div>
                ))}
            </div>

            <div className="button-container">
                <button onClick={clearSelection}>清空</button>
                <button onClick={confirmBet}>确认投注</button>
            </div>

            <div className="bet-history">
                <h3>投注历史记录：</h3>
                <div className="bet-history-container">
                    {rawTickets.map((betInfo) => (
                        <div className="bet-record">
                            <p>红球：{splitString(betInfo.numeros)[0]}</p>
                            <p>蓝球：{splitString(betInfo.numeros)[1]}</p>
                            <p>投注时间：{new Date(betInfo.timestamp/1000).toLocaleString()}</p>
                        </div>))}
                </div>
            </div>
        </div>
    );
}