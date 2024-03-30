import React, { useEffect, useState } from 'react';
import './App.css';
import { Layout, Row, Col, Button, Modal } from "antd";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

function App() {
    const { connect, account, network, connected, disconnect, signAndSubmitTransaction } = useWallet();
    const aptosConfig = new AptosConfig({ network: Network.DEVNET });
    const aptos = new Aptos(aptosConfig);

    const [isGameStarted, setIsGameStarted] = useState(false);
    const [countDown, setCountDown] = useState(0);
    const [clickCount, setClickCount] = useState(0);
    const [showLuckValue, setShowLuckValue] = useState(false);
    const [luckValue, setLuckValue] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [showLuckyEffect, setShowLuckyEffect] = useState(false);

    const clickFish = () => {
        setClickCount(clickCount + 1);
        setShowLuckyEffect(true); // 显示Lucky++效果
        setTimeout(() => {
            setShowLuckyEffect(false); // 一段时间后隐藏效果
        }, 200); // 这里的1000是效果显示的持续时间（毫秒）
    };

    useEffect(() => {
        let interval: ReturnType<typeof setTimeout>;
        if (countDown > 0) {
            interval = setTimeout(() => {
                setCountDown(countDown - 1);
            }, 1000);
        } else if (countDown === 0 && isGameStarted) {
            finishGame();
        }
        return () => clearTimeout(interval);
    }, [countDown, isGameStarted]);

    const gamesetup = () => {
        setIsGameStarted(false);
        setCountDown(0);
        setClickCount(0);
        setShowLuckValue(false);
        setLuckValue(0);
        setIsModalVisible(false);
    };
    const handleDisconnect = () => {
        disconnect();
        // Reset game state
        setIsGameStarted(false);
        setCountDown(0);
        setClickCount(0);
        setShowLuckValue(false);
        setLuckValue(0);
        setIsModalVisible(false);
    };

    const startGame = () => {
        gamesetup();
        setIsGameStarted(true);
        setCountDown(Math.floor(Math.random() * (5 - 3 + 1)) + 3); // 3~20s随机倒计时
        setClickCount(0); // 重置点击次数
    };

    const finishGame = () => {
        setIsGameStarted(false);
        setShowLuckValue(true);
        setLuckValue(clickCount / 10);
    };

    async function buyLuckValue() {
        if (!account) return;
        const targetAddress = "0xa1521be956bf90d2dac111e1e19b3a8f0545f3ac1e49032d1f3daea81ce659b6";
        try {
            const transaction = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: "0x1::coin::transfer",
                    typeArguments: ["0x1::aptos_coin::AptosCoin"],
                    functionArguments: [targetAddress, 1], // 假设每点1次幸运值的价格为1个单位货币
                },
            });
            console.log("Transaction submitted:", transaction);
            setIsModalVisible(true); // 显示购买成功提示
            setShowLuckValue(false); // 隐藏购买按钮和幸运值显示
        } catch (error) {
            console.error("Transaction error:", error);
        }
    }


    return (
        <>
            <Layout>
                <Row align="middle" justify="center" style={{ minHeight: '100vh' }}>
                    <Col>
                        {/* WalletSelector 总是显示 */}
                        <div className="buttonRow">
                            <WalletSelector />
                            {connected && !isGameStarted && (
                                <Button type="primary" onClick={startGame}>
                                    开始
                                </Button>
                            )}
                            {connected && (
                                <Button type="primary" onClick={handleDisconnect}>
                                    断开连接
                                </Button>
                            )}
                        </div>

                        {/* 当游戏开始时显示 */}
                        {isGameStarted && (
                            <>
                                <div className="countdown">倒计时: {countDown}秒</div>
                                <div className="buttonRow">
                                    <Button type="default" onClick={clickFish}>敲木鱼</Button>
                                </div>
                            </>
                        )}
                        {showLuckyEffect && (
                            <div className="luckyEffect" style={{ visibility: 'visible' }}>Lucky++</div>
                        )}
                        {/* 显示幸运值和购买选项 */}
                        {showLuckValue && (
                            <div className="luckValue">
                                <p>你的幸运值是: {luckValue}</p>
                                <Button type="default" onClick={buyLuckValue}>转账购买幸运值</Button>
                            </div>
                        )}
                    </Col>
                </Row>
            </Layout>
            <Modal title="购买成功" visible={isModalVisible} onOk={() => setIsModalVisible(false)} onCancel={() => setIsModalVisible(false)}>
                <p>你成功购买了{luckValue}幸运值！</p>
            </Modal>
        </>
    );
}
export default App;

