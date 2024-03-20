import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
// import logo from "./assets/aptos.png";
import {
    APTOS_COIN,
    Aptos,
    AptosConfig,
    InputViewRequestData,
    Network,
} from "@aptos-labs/ts-sdk";

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);
import {
    useWallet,
    InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";

import {useEffect, useState} from "react";

function App() {
    const { account,network } = useWallet();
    const [timeSlot, setTimeSlot] = useState('');
    const [interviewer, setInterviewer] = useState('');
    const [interviewee, setInterviewee] = useState('');
    const [readdr,setReaddr] = useState('');
    const [index,setIndex] = useState('');
    const MODULE_ADDRESS = "0x1140fb62f9e9a358217001353ff184c96a5b04f8c601b35048fa8485e612f499";
    const {
        signAndSubmitTransaction,
// eslint-disable-next-line react-hooks/rules-of-hooks
    } = useWallet();
    
    useEffect(() => {
        fetchScheduledInterviews();
    }, [account?.address]);

    const fetchScheduledInterviews = async () => {
        if(!account) return [];
        const payload: InputViewRequestData = {
            function: `${MODULE_ADDRESS}::interview::get_scheduled_interviews`,
            functionArguments: [MODULE_ADDRESS],
        };
        const result = await aptos.view( {payload} );
        console.log("Interview list: ", result);
    };



    const scheduleInterview = async (readdr:string , interviewer: string, interviewee: string, timeSlot: string) => {
        if (!account) return [];

        const transaction: InputTransactionData = {
            data: {
                function: `${MODULE_ADDRESS}::interview::schedule_interview`,
                typeArguments: [],
                functionArguments: [readdr,interviewer ,interviewee,timeSlot],
            },
        };
        const response = await signAndSubmitTransaction(transaction);
        console.log(response)
        try {
            await aptos.waitForTransaction({ transactionHash: response.hash });
        } catch (error) {
            console.log(error);
        }

    };

    const cancelInterview = async (addr: string,interviewindex:string) => {
        if (!account) return [];
        const transaction: InputTransactionData = {
            data: {
                function: `${MODULE_ADDRESS}::interview::cancel_interview`,
                typeArguments: [],
                functionArguments: [addr ,interviewindex],
            },
          };

        const response = await signAndSubmitTransaction(transaction);
        try {
            await aptos.waitForTransaction({ transactionHash: response.hash });
        } catch (error) {
            console.error(error);
        }

    };

    return (
        <>
            <WalletSelector />
            <div>
                <h1>Interview Booking System</h1>
                <div>
                    <button onClick={fetchScheduledInterviews}>get interview information</button><br/>
                    <p></p>
                    {/*<input*/}
                    {/*    type="text"*/}
                    {/*    value={readdr}*/}
                    {/*    onChange={(e) => setReaddr(e.target.value)}*/}
                    {/*    placeholder="Recource Address"*/}
                    {/*/>*/}
                    <input
                        type="text"
                        value={interviewer}
                        onChange={(e) => setInterviewer(e.target.value)}
                        placeholder="Interviewer Address"
                    />
                    <input
                        type="text"
                        value={interviewee}
                        onChange={(e) => setInterviewee(e.target.value)}
                        placeholder="Interviewee Address"
                    />
                    <input
                        type="number"
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        placeholder="Time Slot"
                    />
                    <button onClick={() => scheduleInterview(MODULE_ADDRESS,interviewer,interviewee,timeSlot) }>Schedule Interview</button><br/>
                    <input
                        type="number"
                        value={index}
                        onChange={(e) => setIndex(e.target.value)}
                        placeholder="index"
                    />
                    <button onClick={() => cancelInterview(MODULE_ADDRESS,index)}>Cancel Interview</button>
                </div>
            </div>

        </>
    );
}

export default App;
