import { useState, useRef } from "react";
import { Layout, Row, Col, Button, Spin, Input } from "antd";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { Aptos, Network, AptosConfig } from "@aptos-labs/ts-sdk";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";


const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);
// change this to be your module account address
const moduleAddress = "0x4b2f67fac347b8409dbcc930308ac61a2b044e5ce03641bb5e34d7e24e569767";


function App() {
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');
  const [value3, setValue3] = useState('');
  const [value4, setValue4] = useState('');
  const [value5, setValue5] = useState('');
  const [value6, setValue6] = useState('');
  const [value7, setValue7] = useState('');
  const { account, signAndSubmitTransaction } = useWallet();
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  
  const onChange1 = (value: any) => {
    setValue1(value.target.value)
  }
  const onChange2 = (value: any) => {
    setValue2(value.target.value)
  }
  const onChange3 = (value: any) => {
    setValue3(value.target.value)
  }
  const onChange4 = (value: any) => {
    setValue4(value.target.value)
  }
  const onChange5 = (value: any) => {
    setValue5(value.target.value)
  }
  const onChange6 = (value: any) => {
    setValue6(value.target.value)
  }
  const onChange7 = (value: any) => {
    setValue7(value.target.value)
  }
  const begin_lockup = async (withdrawal_address: string, amount: string, want_lock_time: string) => {
    setTransactionInProgress(true);
    if (!account) return [];
    const transaction:InputTransactionData = {
      data: {
        function:`${moduleAddress}::locked_coins::begin_lockup`,
        functionArguments:[withdrawal_address, amount, want_lock_time]
      }
    }
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({transactionHash:response.hash});
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };
  const add_locked_coins = async (amount: string, want_lock_time: string) => {
    setTransactionInProgress(true);
    if (!account) return [];
    const transaction:InputTransactionData = {
      data: {
        function:`${moduleAddress}::locked_coins::add_locked_coins`,
        functionArguments:[amount, want_lock_time]
      }
    }
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({transactionHash:response.hash});
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };
  const cancel_lockup = async (lockid: string) => {
    setTransactionInProgress(true);
    if (!account) return [];
    const transaction:InputTransactionData = {
      data: {
        function:`${moduleAddress}::locked_coins::cancel_lockup`,
        functionArguments:[lockid]
      }
    }
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({transactionHash:response.hash});
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };
  const complete_lockup = async (lockid: string) => {
    setTransactionInProgress(true);
    if (!account) return [];
    const transaction:InputTransactionData = {
      data: {
        function:`${moduleAddress}::locked_coins::complete_lockup`,
        functionArguments:[lockid]
      }
    }
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({transactionHash:response.hash});
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };


  return (
    <>
      <Layout>
        <Row align="middle">
          <Col span={10} offset={2}>
            <h1>Pool Together</h1>
          </Col>
          <Col span={12} style={{ textAlign: "right", paddingRight: "200px" }}>
              <WalletSelector />
          </Col>
        </Row>
      </Layout>
      <Spin spinning={transactionInProgress}>
      <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
        <Col span={8} offset={8}>
          <Input value={value1} onChange={onChange1}/>
          <Input value={value2} onChange={onChange2}/>
          <Input value={value3} onChange={onChange3}/>
          <Button
            onClick={() => begin_lockup(value1, value2, value3)}
            block
            type="primary"
            style={{ backgroundColor: "#3f67ff" }}
          >
            begin_lockup
          </Button>
        </Col>
        <Col span={8} offset={8}>
          <Input value={value4} onChange={onChange4}/>
          <Input value={value5} onChange={onChange5}/>
          <Button
            onClick={() => add_locked_coins(value4, value5)}
            block
            type="primary"
            style={{ backgroundColor: "#3f67ff" }}
          >
            add_locked_coins
          </Button>
        </Col>
        <Col span={8} offset={8}>
        <Input value={value6} onChange={onChange6}/>
          <Button
            onClick={ () => cancel_lockup(value6)}
            block
            type="primary"
            style={{ backgroundColor: "#3f67ff" }}
          >
            cancel_lockup
          </Button>
        </Col>
        <Col span={8} offset={8}>
        <Input value={value7} onChange={onChange7}/>
          <Button
            onClick={ () => complete_lockup(value7)}
            block
            type="primary"
            style={{ backgroundColor: "#3f67ff" }}
          >
            complete_lockup
          </Button>
        </Col>
      </Row> 
      </Spin>
    </>
  );
}

export default App;

        