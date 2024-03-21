import React, { MouseEventHandler, useEffect, useState } from 'react';
import { Button, Checkbox, Col, Input, Layout, List, Row, Spin } from 'antd';
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { wait } from '@testing-library/user-event/dist/utils';

//设置 Aptos 与 testnet 网络交互
const aptosConfig = new AptosConfig({ network: Network.TESTNET });
//初始化一个 Aptos 实例
const aptos = new Aptos(aptosConfig);
// NFTMarket 发布的地址
const moduleAddress = "0x8b256cbe708582fd2deeb0638e286311242b9f8fc386bce8799a24aa9082a271";

//创建一个本地状态 Order 来保存我们的订单（具有我们在智能合约上设置的相同属性）：
type Order = {
  orderId: string,
  seller: string,
  price: string,
  token: string,
  completed: boolean
};

function App() {

  //account 对象是 null 如果没有连接帐户;连接帐户时， account 对象将保存帐户信息，包括帐户地址。
  const { account, signAndSubmitTransaction } = useWallet();
  //用于 Spinner 组件以在等待交易时显示。添加本地状态以跟踪事务是否正在进行中：
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  //orders本地状态，储存order
  const [orders, setOrders] = useState<Order[]>([]);
  //创建一个保存订单内容的新本地状态：
  const [newOrderToken, setNewOrderToken] = useState<string>("");
  const [newOrderPrice, setNewOrderPrice] = useState<string>("");
  //onWriteTask 函数，每当用户在输入文本中键入内容时都会调用该函数
  const onWriteOrderToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setNewOrderToken(value);
  };
  const onWriteOrderPrice = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setNewOrderPrice(value);
  };

  //获取orders

  const fetchOrders = async () => {

    try{

      // 获取NFTMarket发布的地址里orders里的order资源
      const OrdersResource = await aptos.getAccountResource(
        {
          accountAddress:moduleAddress,
          resourceType:`${moduleAddress}::nftmarket::Orders`
        }
      );

      //表句柄
      const orderHandle = (OrdersResource as any).orders.handle;
      //order计数器，以便我们可以循环并获取与 orderId 匹配的任务 order_counter
      const orderCounter = (OrdersResource as any).order_counter;

      //本地的orders表
      let orders = [];
      //本地的orders计数器
      let counter = 1;

      while (counter <= orderCounter) {

        const orderItem = {
          key_type: "u64",
          value_type: `${moduleAddress}::nftmarket::Order`,
          key: `${counter}`,
        };

        const order = await aptos.getTableItem<Order>({handle:orderHandle, data:orderItem});
        orders.push(order);
        counter++;

      }

      setOrders(orders);

    }catch(error: any){

      console.log(error);

    }

  };

  //每当账户信息改变时刷新orders
  useEffect(() => {
    fetchOrders();
  }, [account?.address]);

  //调用链上的方法创建订单
  const onOrderAdded = async () => {

    //检查是否连接钱包
    if (!account) return;

    setTransactionInProgress(true);

    //构建要提交到链的交易数据
    const transaction:InputTransactionData = {
      data: {
        function:`${moduleAddress}::nftmarket::createOrder`,
        functionArguments:[newOrderToken,newOrderPrice]
      }
    };

    const latestId = orders.length > 0 ? parseInt(orders[orders.length - 1].orderId) + 1 : 1;

    const newOrderToPush = {
      orderId: latestId + "",
      seller: account.address,
      price: newOrderPrice,
      token: newOrderToken,
      completed: false,
  };

  try {
    //签署并往链上提交交易
    const response = await signAndSubmitTransaction(transaction);
    //等待交易
    await aptos.waitForTransaction({transactionHash:response.hash});

    //由当前的状态创建一个新数组
    let newOrders = [...orders];

    //往里面添加order
    newOrders.push(newOrderToPush);

    //set state
    setOrders(newOrders);

    //clear the input
    setNewOrderToken("");
    setNewOrderPrice("");

  } catch (error) {
    console.log("error",error);
  } finally {
    setTransactionInProgress(false);
  };

};

//todo 购买
const onOrderPurchased = async (orderId: string) => {
  
  if (!account) return;

  setTransactionInProgress(true);

  const transaction:InputTransactionData = {
    data: {
      function:`${moduleAddress}::nftmarket::transfer`,
      functionArguments:[orderId]
    }
  };

  try {

    const response = await signAndSubmitTransaction(transaction);

    await aptos.waitForTransaction({transactionHash:response.hash});  
    
    let newOrdes = [...orders];
  
    for (const order of newOrdes) {
      if (order.orderId === orderId) {
        newOrdes.splice(newOrdes.indexOf(order), 1);
      }
    };

    setOrders(newOrdes);

  } catch (error) {
    console.log("error",error);
  } finally {
    setTransactionInProgress(false);
  };

}

//todo 修改价格?

//todo 取消订单
const onOrderCanceled = async (orderId: string) => {
  
  if (!account) return;

  setTransactionInProgress(true);

  const transaction:InputTransactionData = {
    data: {
      function:`${moduleAddress}::nftmarket::cancelOrder`,
      functionArguments:[orderId]
    }
  };

  try {
    
    const response = await signAndSubmitTransaction(transaction);

    await aptos.waitForTransaction({transactionHash:response.hash});

    let newOrdes = [...orders];

    for (const order of newOrdes) {
      if (order.orderId === orderId) {
        newOrdes.splice(newOrdes.indexOf(order), 1);
      }
    };

    setOrders(newOrdes);

  } catch (error) {
    console.log("error",error);
  } finally {
    setTransactionInProgress(false);
  }
}

  return (

    <>

      {/* 顶部栏，连接钱包按钮 */}
      <Layout>
        <Row align="middle">

          <Col span={10} offset={2}>
            <h1>NFT Market</h1>
          </Col>

          <Col span={10} style={{ textAlign: "right", paddingRight: "200px" }}>
            <WalletSelector />
          </Col>

        </Row>
      </Layout>

      <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>

        {/* Add Order按钮 */}
        <Col span={8} offset={8}>
          <Input.Group compact>
            <Row>
            <Input
            // 当用户在 Input 组件上键入某些内容时，将触发一个函数并使用该内容设置我们的本地状态。
              onChange={(event) => onWriteOrderToken(event)}
              value={newOrderToken}
              style={{ width: "calc(100% - 60px)" }}
              placeholder="TokenAddress"
              size="large"
            />
            </Row>
            <Row>
            <Input
            // 当用户在 Input 组件上键入某些内容时，将触发一个函数并使用该内容设置我们的本地状态。
              onChange={(event) => onWriteOrderPrice(event)}
              value={newOrderPrice}
              style={{ width: "calc(100% - 60px)" }}
              placeholder="Price"
              size="large"
            />
            </Row>
            <Row>
            <Button
            onClick={onOrderAdded}
              type="primary"
              style={{ height: "40px", backgroundColor: "#3f67ff" }}
            >
              Add
            </Button>
            </Row>

          </Input.Group>
        </Col>
        
        <Col span={8} offset={8}>
          {orders && (
            <List
              size="default"
              bordered
              dataSource={orders}
              renderItem={(order: any) => (
                <List.Item actions={[
                <>
                <Button
                onClick={() =>onOrderPurchased(order.orderId)}
                type='primary'
                style={{ height: "30px", backgroundColor: "#3f67ff" }}
                >Buy</Button>
                <Button
                onClick={() =>onOrderCanceled(order.orderId)}
                type='primary'
                style={{ height: "30px", backgroundColor: "#3f67ff" }}
                >Remove</Button>
                </>
                ]}>
                  <List.Item.Meta
                    title={""}
                    description={
                      <>
                      <p>Price : {order.price}</p>
                      <p>OrderId : {order.orderId}</p>
                      <p>Seller : {order.seller}</p>
                      <a
                      href={`https://explorer.aptoslabs.com/account/${order.token.inner}/`}
                      target="_blank"
                      >Token : {order.token.inner}</a>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Col>

      </Row>
    
    </>

  );

}

export default App;
