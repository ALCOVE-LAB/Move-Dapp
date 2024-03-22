'use client'
import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network, GetAccountOwnedTokensQueryResponse } from "@aptos-labs/ts-sdk";
import Card from "../ui/collections/card";
function Page() {
    const { account } = useWallet();
    const aptosConfig = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(aptosConfig);
    const [tokenList, setTokenList] = useState<GetAccountOwnedTokensQueryResponse>([])
    const fetchList = async () => {
        if (!account) return [];
        try {
            const tokens = await aptos.getAccountOwnedTokens({ accountAddress: account?.address });
            console.log('tokens:', tokens)
            setTokenList(tokens)
        } catch (e: any) {
        }
    };
    useEffect(() => {
        fetchList();
    }, [account?.address]);
    return (
        <div className="flex justify-center mt-10">
            <div className="w-2/3 flex flex-wrap justify-start gap-4">
                {tokenList.map((item, index) => {
                    return (
                        <Card token={item} key={index} />
                    )
                })}

            </div>
        </div>
    )
}
export default Page;