import React, { useState, useEffect} from 'react';
import logo from './aptos-apt-logo.svg';
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import './App.css';
import { Aptos , Account, AccountAddress, AptosConfig, Network, NetworkToNetworkName } from "@aptos-labs/ts-sdk";
import {
    useWallet,
    InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
// const envNetwork = process.env.APTOS_NETWORK;
// const networkName = envNetwork ? NetworkToNetworkName[envNetwork] || Network.TESTNET : Network.TESTNET;
// const APTOS_NETWORK: Network = networkName;


const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

export const moduleAddress  ="0x286a47b861c72b5ed2a46b5dc4d78ccbd3053a645c837742c586f97ed8992f0e";
interface AccountInfo {
    address: string;
    coinBalance: string;
}

function App() {
    const nftData = [
        { id: 1, name: 'NFT 1', imageUrl: 'url_to_image_1' },
        { id: 2, name: 'NFT 2', imageUrl: 'url_to_image_2' },
        { id: 3, name: 'NFT 3', imageUrl: 'url_to_image_3' },
        // 其他NFT数据...
    ];
    const [walletNFTs, setWalletNFTs] = useState([]);
    const [accountHasList, setAccountHasList] = useState<boolean>(false);
    const { account, signAndSubmitTransaction } = useWallet();
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [link, setLink] = useState('');
    const [previewLink, setPreviewLink] = useState('');
    const [address, setAddress] = useState('');
    const [coinBalance, setCoinBalance] = useState('');
    const [accountInfo, setAccountInfo] = useState<AccountInfo>({ address: '', coinBalance: '' });
    const handleLinkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputLink = event.target.value;
        setLink(inputLink);

        // 將圖片連結設置到預覽框中
        setPreviewLink(inputLink);
    };
    // useEffect(() => {
    //     // 这里模拟从钱包中获取NFT数据的过程
    //     // 假设你从钱包中获取了NFT数据并将其存储在state中
    //     setWalletNFTs(nftData);
    // }, []);
    // const connectWalletAndGetNFTs = async () => {
    //     try {
    //         // 连接钱包
    //
    //
    //         // 检查用户是否已经连接了钱包
    //         if (!account) {
    //             console.error("User is not connected to a wallet.");
    //             return
    //         }
    //         else{
    //             // 获取用户的地址
    //             const user_token_id = aptos.getAccountOwnedTokens({accountAddress: account.address,token_data_id});
    //         aptos.get
    //             // 查询用户在特定合约中持有的 NFT 列表
    //             user_token_id.token_data_id
    //
    //             // 处理获取到的 NFT 数据
    //             console.log("User's NFTs:", userownedtoken);
    //         }
    //     } catch (error) {
    //         console.error("Error connecting wallet or fetching NFTs:", error);
    //     }
    // };
    const handleButtonClick = async () => {
        try {
            console.log('Button clicked');

            if (!account) return;
            if (!link.includes("https") && !link.includes("ipfs")) {
                console.log('Invalid link. Minting is only allowed for links starting with "https" or "ipfs".');
                alert('Invalid link. \nMinting is only allowed for links starting with "https" or "ipfs".');
                return;


            }
            const transaction: InputTransactionData = {
                  data: {
                     function: `${moduleAddress}::dapp::mint_single_collection`,
                     functionArguments: [link]
                    }
                };
                const response = await signAndSubmitTransaction(transaction);
                await aptos.waitForTransaction({ transactionHash: response.hash });
            alert('Mint Success.');


        } catch (error) {
            if ((error as any).code === 'USER_REJECTED_REQUEST') {
                console.log('User rejected wallet connection.');// 将此消息记录为信息
            } else {
                console.error('An error occurred while minting:', error as any);
            }
        }
    };
    // const fetchList = async () => {
    //     const [accountHasList, setAccountHasList] = useState<boolean>(false);
    //     if (!account) return [];
    //     // change this to be your module account address
    //     const moduleAddress = "0xcbddf398841353776903dbab2fdaefc54f181d07e114ae818b1a67af28d1b018";
    //     try {
    //         const todoListResource = await aptos.getAccountResource(
    //             {
    //                 accountAddress:account?.address,
    //                 resourceType:`${moduleAddress}::todolist::TodoList`
    //             }
    //         );
    //         setAccountHasList(true);
    //     } catch (e: any) {
    //         setAccountHasList(false);
    //     }
    // };
    const getBalance = async (accountAddress: AccountAddress, coinTypeAddress: AccountAddress) => {
        const amount = await aptos.getAccountCoinAmount({
            accountAddress,
            coinType: `${coinTypeAddress.toString()}::moon_coin::MoonCoin`,
        });

        return amount;
    };
    const fullAddress = accountInfo.address;
    const start = fullAddress.substring(0, 5);
    const end = fullAddress.substring(fullAddress.length - 5);
    const trimmedAddress = `${start}...${end}`;


    const fetchData = async () => {
        try {
            if (!account) return;

            // 从Aptos SDK获取账户信息
            const accountInfo = await aptos.getAccountInfo({ accountAddress: account.address });
            const fullAddress = account.address;
            const start = fullAddress.substring(0, 6);
            const end = fullAddress.substring(fullAddress.length - 5);
            const trimmedAddress = `${start}...${end}`;
            setAddress(trimmedAddress.toString());

            // 从Aptos SDK获取硬币余额
            const balance = await aptos.getAccountCoinAmount({
                accountAddress: account.address,
                coinType: "0x1::aptos_coin::AptosCoin", // 你需要提供一个有效的合约地址
            });
            const coinBalance = balance;
            if (!isNaN(coinBalance)) {
                const coinBalanceDecimal = balance;
                const coinBalanceInteger = Math.round(coinBalanceDecimal );
                const formattedCoinBalance = (coinBalanceInteger / 100000000).toFixed(4);
                setCoinBalance(formattedCoinBalance.toString());
            } else {
                console.error('Invalid coin balance:', coinBalance);
            }
        } catch (error) {
            console.error('Error fetching account info:', error);
        }
    };
     const Mint_single_collection = async() =>{


        if (!account) return [];

        if (!link.includes("https") && !link.includes("ipfs")) {
            console.log('Invalid link. Minting is only allowed for links starting with "https" or "ipfs".');
            alert('Invalid link. \nMinting is only allowed for links starting with "https" or "ipfs".');
            return;


        }

        const transaction:InputTransactionData = {
            data: {
                function:`${moduleAddress}::dapp::mint_single_collection`,
                functionArguments:[link]
            }
        }
        try {
            // sign and submit transaction to chain
            const response = await signAndSubmitTransaction(transaction);
            alert('Mint Success.');
            // wait for transaction
            await aptos.waitForTransaction({transactionHash:response.hash});
            await fetchData();
            await connectWalletAndGetNFTs();
            setAccountHasList(true);
            setLink('');
            setPreviewLink('');
        } catch (error: any) {
            setAccountHasList(false);
            setPreviewLink('');
            console.error("Minting failed:", error);
        }
    }

    useEffect(() => {


        fetchData();
    }, [account]);
    // const handleWalletSelect = (wallet) => {
    //     // 在這裡處理選擇錢包後的邏輯
    //     // 例如，設置選擇的錢包狀態或執行其他操作
    //     setSelectedWallet(wallet);
    // };
  return (

      <div className="App">

          <button className="App-button">
              <WalletSelector/>
          </button>

          <header className="App-text"><p>
              welcome to aptos NFT.
          </p>
              <p>you can send https / IPFS to make your own nft</p>
          </header>
          <header className="App-header">
              <img src={logo} className="App-logo" alt="logo"/>
              <a
                  className="App-link"
                  href="https://github.com/yue1823"
                  target="_blank"
                  rel="noopener noreferrer"
              >
                  My github
              </a>
          </header>
          <header className="App-CenteredContainer">
          </header>
          <header className="App-CenteredContainer2">
              <span>Link: </span>
              <input type="text" value={link} onChange={handleLinkChange}/>


          </header>
          {/*<header className="App-button2">
              <button onClick={handleButtonClick}>Submit</button>
          </header>*/}
          <header className="App-Preview">
              {/* 顯示圖片預覽 */}
              {previewLink && (
                  <div>
                      <h3>Preview</h3>
                      <img src={previewLink} alt="Preview" style={{maxWidth: '90%', maxHeight: '200px'}}/>
                  </div>
              )}
          </header>

          <header className="App-button2">
              <button onClick={Mint_single_collection}>Mint</button>
          </header>
          <header className="App-rule">
              <p>1.each mint , mint 1 NFT</p>
              <p>2.each mint need to pay 0.1 apt</p>
          </header>
          <header className="APP-LeftPanel"><p></p></header>
          <header className="APP-LeftPane2">
              <p>Address: {address}</p>
              <p>Coin balance: {coinBalance}</p>
          </header>
          <header className="APP-LeftPanel_black">
              <p></p>
          </header>
      {/*    <div className="App">*/}
      {/*        <div className="APP-LeftPanel_black">*/}
      {/*            {walletNFTs.slice(0, 9).map(nft => (*/}
      {/*                <div key={nft.id} className="nft-item">*/}
      {/*                    <img src={nft.imageUrl} alt={nft.name}/>*/}
      {/*                    <p>{nft.name}</p>*/}
      {/*                </div>*/}
      {/*            ))}*/}
      {/*        </div>*/}
      {/*    </div>*/}
      </div>

  );
}

export default App;
