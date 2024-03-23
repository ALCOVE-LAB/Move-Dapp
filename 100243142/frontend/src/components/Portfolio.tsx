import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import SendIcon from '@mui/icons-material/Send';
import {useEffect, useState} from "react";

import  {fetchMyNFTQuery} from "./Indexer"

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
    Account,
    AccountAddress,
    Aptos,
    AptosConfig,
    MoveStructId, MoveValue,
    Network,
    NetworkToNetworkName
} from "@aptos-labs/ts-sdk";





export function Portfolio() {
    const aptosConfig = new AptosConfig({ network: Network.DEVNET });
    const aptos = new Aptos(aptosConfig);
    const {
        account,
        signAndSubmitTransaction,
    } = useWallet();
    const [nftLst, setNftLst] = useState([]);
    const [tokenNames, setTokenNames] = useState({});

    console.log(account)

    // const [content1, setcontent1] = useState("12345");

    // let nftLst = []
    // console.log(12)



    // useEffect(()=>{
    //     setaddress(account.address)
    // },account)

    useEffect(() => {
        if(account?.address == null){
            return;
        }
        fetchMyNFTQuery(account?.address)
            .then(({ data, errors }) => {
                if (errors) {
                    console.error(errors);
                    return;
                }

                setNftLst(data.current_token_ownerships_v2);
                console.log(data.current_token_ownerships_v2)
                console.log(Array.isArray(nftLst))
            })
            .catch(error => {
                console.error(error);
            });
    }, [account]);
    useEffect(() => {
        console.log("Token Names:");
        console.log(tokenNames);
    }, [tokenNames]);


    useEffect(() => {
        async function fetchTokenNames() {
            // console.log(nftLst)
            const tokenIds = nftLst.map(item => item.token_data_id);
            console.log(tokenIds);
            let nft_lst = await get_tokens_names(tokenIds);
            console.log("nft_lst");
            console.log(nft_lst);


            // console.log(tokenNames)
            let tokenMap = nft_lst.reduce((acc, obj) => {
                acc[obj.token_id] = {
                    collection_id: obj.collection_id,
                    collection_name: obj.collection_name,
                    name: obj.name,
                    url: obj.url
                };
                return acc;
            }, {});

            console.log("111")
            console.log(tokenMap)
            setTokenNames(tokenMap)
            console.log(tokenNames)


            // const tokenNameMap = {};
            // for (const item of nftLst) {
            //     const tokenName = await get_token_name(item.token_data_id);
            //     tokenNameMap[item.token_data_id] = tokenName;
            // }
            // setTokenNames(tokenNameMap);
            // console.log(tokenNameMap)
        }
        if (nftLst.length > 0) {
            fetchTokenNames();
        }
    }, [nftLst]);



    async function get_tokens_names(tokenIds) {
        try {
            const data = await aptos.view({
                payload: {
                    function: `ed4908bdbd6b3f085919b5a5c98bedcb369bf724d66be2191ba73f5f876cedbd::mynft::get_tokens_infos`,
                    // typeArguments: ["0x4::token::Token"],
                    functionArguments: [tokenIds],
                },
            });
            console.log("data[0]");
            console.log(data[0]);
            return data[0];
        } catch (err) {
            console.error(err);
            return "Error fetching token name";
        }
    }

    // async function get_token_name(token_id) {
    //     try {
    //         const data = await aptos.view({
    //             payload: {
    //                 function: `ee5b4e567dfbdcaf9f76979245cbdd963c28bfb923ddbe59dbc4bf47867469fa::mynft::get_tokens_infos`,
    //                 // typeArguments: ["0x4::token::Token"],
    //                 functionArguments: [[token_id]],
    //             },
    //         });
    //
    //         return data[0];
    //     } catch (err) {
    //         console.error(err);
    //         return "Error fetching token name";
    //     }
    // }

    return (
        <>
            <Box sx={{ width: "70%",  margin: 2, backgroundColor: ' rgb(220, 235, 242)',borderRadius: 5 }}  >
                <div style={{ padding: 12, borderRadius: 5  }} className="container">

                        {/*因为先nft再tokenNames，所以是先渲染，才更新的数据，所以页面数据更新可能失败*/}
                        {/*{nftLst.map((item, index) => {*/}
                        {/*    console.log(tokenNames[item.token_data_id])*/}
                        {/*    return (*/}

                        {/*        <Box   sx={{ width: 200, height: 250 ,backgroundColor: 'rgb(187, 224, 242)' ,marginTop:2}} key={index}>*/}
                        {/*            <a href={"https://explorer.aptoslabs.com/object/"+item.token_data_id+"?network=devnet"}>*/}
                        {/*            <Stack spacing={2}>*/}
                        {/*                <img  style={{width:150,height:150,margin:"0 auto",marginTop:10 }} src={tokenNames[item.token_data_id]?.url}></img>*/}
                        {/*                <div>TokenName:{tokenNames[item.token_data_id]?.name || "Loading..."}  </div>*/}
                        {/*                /!*<div>{tokenNames[item.token_data_id]?.url || "Loading..."}</div>*!/*/}
                        {/*                <div>Collection:{tokenNames[item.token_data_id]?.collection_name || "Loading..."}</div>*/}
                        {/*            </Stack>*/}
                        {/*            </a>*/}
                        {/*        </Box>*/}
                        {/*    )*/}

                        {/*}*/}


                        {/*)}*/}


                    {Object.keys(tokenNames).map((tokenDataId, index) => {
                        const tokenInfo = tokenNames[tokenDataId];
                        return (
                            <Box sx={{ width: 200, height: 250, backgroundColor: 'rgb(187, 224, 242)', marginTop: 2 }} key={index}>
                                <a href={"https://explorer.aptoslabs.com/object/" + tokenDataId + "?network=devnet"}>
                                    <Stack spacing={2}>
                                        <img style={{ width: 150, height: 150, margin: "0 auto", marginTop: 10 }} src={tokenInfo.url}></img>
                                        <div>TokenName: {tokenInfo.name || "Loading..."} </div>
                                        <div>Collection: {tokenInfo.collection_name || "Loading..."}</div>
                                    </Stack>
                                </a>
                            </Box>
                        );
                    })}



                    {/*{Array.isArray(nftLst) && nftLst.map((item, index) => (*/}
                    {/*    <Box key={index} sx={{ width: 200, height: 250 ,backgroundColor: 'white' ,marginTop:5}}>1111</Box>*/}
                    {/*))}*/}

                </div>
            </Box>
        </>
    )
}
