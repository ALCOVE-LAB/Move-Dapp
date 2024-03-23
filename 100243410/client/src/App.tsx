import React, {useEffect, useState} from 'react';
import './App.css';
import {Button, Col, Layout, Row} from 'antd';
import {WalletSelector} from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import {Content, Footer} from "antd/es/layout/layout";
import {Aptos,AptosConfig, Network,APTOS_COIN,AccountAddressInput} from "@aptos-labs/ts-sdk"
import {InputTransactionData, useWallet} from "@aptos-labs/wallet-adapter-react";
import { AccountInfo } from '@aptos-labs/wallet-adapter-core';

function App() {
    // 基础配置
    //----------------------
    // 在钱包内获取需要的信息
    const {account, signAndSubmitTransaction} = useWallet()
    // 实例化 aptos
    const aptosConfig = new AptosConfig({network: Network.DEVNET});
    const aptos = new Aptos(aptosConfig)
    //
    // -------------------------
    // 模块地址
    const moduleAddress = "0xd9a2ded3fa92dc9062d381c51530e936376dfddd37611af6aa27e44a7978dda7"
    // const [nowAcount,setNowAccount] = useState()

    // -------------------------

    const [prizes, setPrizes] = useState([]);
    const [selectedPrize, setSelectedPrize] = useState(null);

    const handleAddPrize = () => {
        const newPrize = prompt("请输入奖品名称:");
        if (newPrize) {
            // @ts-ignore
            setPrizes([...prizes, newPrize]);
        }
    };

    const handleSelectPrize = () => {
        const randomIndex = Math.floor(Math.random() * prizes.length);
        setSelectedPrize(prizes[randomIndex]);
    };

    //----------------------------------
    const [nowBalance, setNowBalance] = useState()
    //

    const participants = ["Alice", "Bob", "Charlie", "David", "Eve"];
    const [winner, setWinner] = useState<string | null>(null);
    const [remainingParticipants, setRemainingParticipants] = useState<string[]>([...participants]);
    // 抽奖的逻辑
    // const handleDraw = () => {
    //     //
    //     if (remainingParticipants.length > 0) {
    //         const randomIndex = Math.floor(Math.random() * remainingParticipants.length);
    //         const winnerName = remainingParticipants[randomIndex];
    //         setWinner(winnerName);
    //         setRemainingParticipants(prevParticipants => prevParticipants.filter(name => name !== winnerName));
    //     } else {
    //         setWinner("No participants left");
    //     }
    // };
    // -----------------
    // 买票
    const  buy_ticket = async () =>{
        console.log("获取一个随机数")
        if(!account) return [];
        const transaction:InputTransactionData = {
            data: {
                function: `${moduleAddress}::randoom::buy_ticket`,
                functionArguments:[]
            }
        }
        try{
            const response = await signAndSubmitTransaction(transaction);
            await aptos.waitForTransaction({transactionHash:response.hash});
        }catch(error:any){
            console.log(error);
        }
    }

    // 获取一个随机数
    const getRandomNum = async () => {
        console.log("获取一个随机数");
        if(!account) return [];
        const transaction:InputTransactionData = {
            data: {
                function: `${moduleAddress}::randoom::random_u8`,
                functionArguments:[]
            }
        }
        try{
            const response = await signAndSubmitTransaction(transaction);
            await aptos.waitForTransaction({transactionHash:response.hash});
            console.log(response.events[1].data.value)
        }catch(error:any){
            console.log(error);
        }
    }
    // 开始抽奖
    const handleDraw = async () => {
        console.log("开始抽奖");
        if(!account) return [];
        const transaction:InputTransactionData = {
            data: {
                function: `${moduleAddress}::randoom::pick_winner`,
                functionArguments:[]
            }
        }
        try{
            const response = await signAndSubmitTransaction(transaction);
            await aptos.waitForTransaction({transactionHash:response.hash});
            console.log(response)

            if (response.events[3].data.value === account?.address) {
                const winnerName = "您中奖了";
                setWinner(winnerName);
                // setRemainingParticipants(prevParticipants => prevParticipants.filter(name => name !== winnerName));
            } else {
                setWinner("您未中奖");
            }

        }catch(error:any){
            console.log(error);
        }


    }
// 获取余额
        const refreshBalance = async () => {
            await fetchBalance(account);
        };

    // 获取余额
    const fetchBalance = async (account: AccountInfo | null) => {
        if(!account)return[];
        console.log("当前的账户地址是：", account?.address)
        try {
            // @ts-ignore
            const resource = await aptos.getAccountCoinAmount({
                accountAddress: account?.address as AccountAddressInput,
                coinType: APTOS_COIN
            })
            const coin = resource / 100000000;
            setNowBalance( coin as any);
            console.log("余额：",coin)
        } catch (error) {
            console.log(error)
        }
    }

    // ----------------
    // 用户地址更新的时候重新渲染
    useEffect(()=>{
        fetchBalance(account);
        // const intervalId = setInterval(() => {
        //     fetchBalance(account);
        // }, 5000); // 每2秒执行一次 fetchBalance
        // 组件卸载时清除定时器
        // return () => clearInterval(intervalId);
    },[account?.address])

    //-------------------------------
    const [initialBalance, setInitialBalance] = useState(null);
    const [currentBalance, setCurrentBalance] = useState(null);

    useEffect(() => {
        const fetchInitialBalance = async () => {
            try {
                const resource = await aptos.getAccountCoinAmount({
                    accountAddress: account?.address as AccountAddressInput,
                    coinType: APTOS_COIN // 你的币种类型
                });
                const coin = resource / 100000000;
                setInitialBalance(coin as any); // 假设资源单位为 Satoshi
            } catch (error) {
                console.error('获取初始余额失败:', error);
            }
        };

        fetchInitialBalance();
    }, [account?.address]);

    useEffect(() => {
        const fetchCurrentBalance = async () => {
            try {
                const resource = await aptos.getAccountCoinAmount({
                    accountAddress: account?.address as AccountAddressInput,
                    coinType: APTOS_COIN // 你的币种类型
                });
                const coin = resource / 100000000;
                setCurrentBalance(coin as any); // 假设资源单位为 Satoshi
            } catch (error) {
                console.error('获取当前余额失败:', error);
            }
        };

        const intervalId = setInterval(fetchCurrentBalance, 2000); // 每隔2秒获取一次当前余额

        return () => clearInterval(intervalId);
    }, [account?.address]);

    useEffect(() => {
        if (initialBalance !== null && currentBalance !== null) {
            if (currentBalance > initialBalance) {
                console.log('余额增加了: ',currentBalance - initialBalance);
            } else if (currentBalance < initialBalance) {
                console.log('余额减少了: ',currentBalance - initialBalance);
            } else {
                console.log('余额未变化: ',currentBalance - initialBalance);
            }
        }
    }, [initialBalance, currentBalance]);

  return (
    <>
      <Layout>
        <Row align="middle">
          <Col span={10} offset={2}>
            <h1>Random Number</h1>
              {/*<span>*/}
              {/*    <p>当前余额：{nowBalance} APT</p>*/}
              {/*  <Button onClick={refreshBalance}>刷新余额</Button>*/}
              {/*</span>*/}
          </Col>

          <Col span={12} style={{ textAlign: "right", paddingRight: "200px" }}>
            <WalletSelector />
          </Col>
        </Row>
        <Content>
            <Row>
                <Col span={8} offset={2}>
                    <Button
                        onClick={buy_ticket}
                        block
                        type="primary"
                        style={{textAlign:"center"}}
                    >先买票</Button>
                </Col>
                <Col span={4}>
                    <></>
                </Col>
                <Col span={8}>
                    <Button
                        onClick={handleDraw}
                        block
                        type="primary"
                        style={{textAlign:"center"}}
                    >后抽奖</Button>
                </Col>

                {/*<p>aip-41 Move Aips for randomneww generation</p>*/}
            </Row>
            <Row>
                <Col span={8} offset={10}>
                    <h1>
                        {winner && <p>恭喜: {winner}</p>}
                        {!winner && <p>暂无获奖者</p>}
                    </h1>

                </Col>
            </Row>



            {/*<Row>*/}
            {/*    <Col>*/}
            {/*        <Button*/}
            {/*            onClick={getRandomNum}*/}
            {/*            block*/}
            {/*            type="primary"*/}
            {/*            style={{textAlign:"center"}}*/}
            {/*        >获取一个随机数</Button>*/}
            {/*    </Col>*/}
            {/*</Row>*/}
        </Content>
        <Footer>
            {/*<div className="App">*/}
            {/*    <h1>选择抽奖动画</h1>*/}
            {/*    <div className="prizes">*/}
            {/*        {prizes.map((prize, index) => (*/}
            {/*            <div key={index} className={`prize ${selectedPrize === prize ? 'selected' : ''}`}>*/}
            {/*                {prize}*/}
            {/*            </div>*/}
            {/*        ))}*/}
            {/*    </div>*/}
            {/*    <button onClick={handleAddPrize}>添加奖品</button>*/}
            {/*    <button onClick={handleSelectPrize}>选择奖品</button>*/}
            {/*</div>*/}
            <Col span={8} offset={10}>
            <p>初始余额: {initialBalance}</p>
            <p>当前余额: {currentBalance}</p>
            </Col>

        </Footer>
      </Layout>
    </>
  );
}

export default App;
