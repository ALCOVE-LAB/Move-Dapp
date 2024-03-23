import { useState, useEffect } from "react";
import { Input, Modal, message } from "antd";

// import {  Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
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


import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import Button from '@mui/material/Button';

import Stack from '@mui/material/Stack';
import SendIcon from '@mui/icons-material/Send';

import * as React from "react";

import {fetchMyNFTQuery} from './Indexer'


// const Item = styled(Paper)(({ theme }) => ({
//     backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
//     ...theme.typography.body2,
//     padding: theme.spacing(1),
//     textAlign: 'center',
//     color: theme.palette.text.secondary,
// }));
//




function Mint() {
    const [messageApi, contextHolder] = message.useMessage();
    const [content1, setcontent1] = useState("12345");
    const {
        account,
        signAndSubmitTransaction,
    } = useWallet();

    const aptosConfig = new AptosConfig({ network: Network.DEVNET });
    const aptos = new Aptos(aptosConfig);

    // 处理文本框变化的函数
    const handleInputChange = (event) => {
        setcontent1(event.target.value); // 更新状态为文本框的当前值
    };



    // const contract = "0xc049f30b2e38984c914b70bf5e2f8d4d281773ef6b561339ae842560f4fa47b2"
    return (
    <>
      {contextHolder}
      <div style={{ backgroundColor: 'white' ,padding:12,borderRadius: 5}} >
      <h1>NFT-MINT</h1>

            <Box sx={{ width: 600,height:400 ,margin: 2, }} >
                <Stack spacing={10}>
                    <TextField fullWidth label="NFT-Content" id="fullWidth" value={content1} onChange={handleInputChange} />
                    <TextField fullWidth label="NFT-Content2" id="fullWidth2" value={"not use"} />
                    <Button variant="contained" endIcon={<SendIcon />} onClick={
                        ()=>{

                            const onSignAndSubmitTransaction = async () => {
                                const response = await signAndSubmitTransaction({
                                    sender: account?.address,
                                    data: {
                                        function: "0xeabbe35ac4b276d08f47a7c473fda75e7f1187c560ade1684f698af6cdb8367c::mynft::mint_cat",
                                        // typeArguments: ["0x1::aptos_coin::AptosCoin"],
                                        functionArguments: [ content1 ],
                                    },
                                });
                                // if you want to wait for transaction
                                try {
                                    await aptos.waitForTransaction({ transactionHash: response.hash });
                                    console.log("transaction success!")
                                    messageApi
                                        .open({
                                            type: "success",
                                            content: "Transaction Successful",
                                            duration: 1.5,
                                        })
                                        .then(() => {})

                                } catch (error) {
                                    messageApi
                                        .open({
                                            type: "error",
                                            content: "Transaction Failed",
                                            duration: 1.5,
                                        })
                                        .then(() => { });
                                }
                            };
                            onSignAndSubmitTransaction()



                        }
                    }>
                        Mint
                    </Button>



                </Stack>
            </Box>





      </div>
    </>
    );
    }

export default Mint;
