import './App.css';
import { Layout, Row, Col, Button, Card, Space } from "antd";

import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

import { Account, Aptos } from "@aptos-labs/ts-sdk";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";

import { useEffect } from "react";
import { useState } from 'react';

import { AptosClient, FaucetClient } from "aptos";

export const NODE_URL = "https://fullnode.devnet.aptoslabs.com";


function App() {
  const aptos = new Aptos();
  const client = new AptosClient(NODE_URL);
  const { account, signAndSubmitTransaction } = useWallet();
  const [accountHasList, setAccountHasList] = useState<boolean>(false);
  const [hasGetAllTokenDataList, setHasGetAllTokenDataList] = useState<boolean>(false);
  const [hasGetAllTokenDataList2, setHasGetAllTokenDataList2] = useState<any[]>();

  let getAllTokenData: any;
  let getAllTokenDataList: any[] = [];

  if (hasGetAllTokenDataList == true) {
    console.log("hasGetAllTokenDataList2 = " + hasGetAllTokenDataList2);

  }

  const mintNFT = async () => {
    if (!account) return [];
    const moduleAddress = "0x84ff3d532456f1f2a68cc882f54c6fe486b437312688635bcf030aec24db6561";

    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::nftlist::mint`,
        functionArguments: [account?.address]
      }
    }

    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      setAccountHasList(true);
      console.log("mint function ");
    } catch (error: any) {
      setAccountHasList(false);
    } finally {
      //setTransactionInProgress(false);
    }
  }


  const fetchList = async () => {
    if (!account) return [];
    const moduleAddress = "0x84ff3d532456f1f2a68cc882f54c6fe486b437312688635bcf030aec24db6561";
   
    try {
      const tokens = await aptos.getAccountOwnedTokens({
        accountAddress: account?.address,
        minimumLedgerVersion: 1234,
      });

      getAllTokenData = tokens;
      for (var i in getAllTokenData) {
        getAllTokenDataList.push("https://ipfs.io/ipfs/" + (getAllTokenData[i].current_token_data?.token_uri).substring(7))
      }

      if (getAllTokenDataList.length > 0) {
        setHasGetAllTokenDataList2(getAllTokenDataList);
        setHasGetAllTokenDataList(true);
      }
    } catch (e: any) {
      setHasGetAllTokenDataList(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [account?.address]);

  return (
    <>
      <Layout>
        <Row align="middle">
          <Col span={10} offset={2}>
            <h1>我的NFT會員卡</h1>
          </Col>

          <Col span={12} style={{ textAlign: "right", paddingRight: "200px" }}>
            <WalletSelector />
          </Col>
        </Row>
      </Layout>
      <Button onClick={mintNFT}>獲取一個專屬的NFT</Button>
      <br></br>
      {(hasGetAllTokenDataList == true) ? (
        <>
          <br></br>
          你的NFT會員列表以下:
          <br></br>
          <Space size={[4, 20]} wrap align="center">
            {hasGetAllTokenDataList2 ? (
              <>
                {hasGetAllTokenDataList2.map((item, index) => (
                  <>
                    <Card title="我的會員卡" extra={<a href="#">{index + 1}</a>} style={{ width: 300 }}>
                      <img src={item} width="250" key={index} />
                    </Card>
                  </>
                ))}
              </>
            ) : (
              <>
              </>
            )}

          </Space>
        </>
      )
        :
        (
          <>
            請登入
          </>
        )}


    </>
  );
}

export default App;