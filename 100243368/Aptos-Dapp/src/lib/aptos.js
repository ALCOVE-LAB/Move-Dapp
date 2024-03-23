import {Aptos,AptosConfig,Network,Account} from "@aptos-labs/ts-sdk";


let link = null;
const self={
    init: (network, ck) => {
        if (link !== null) return ck && ck(link);
        switch (network) {
            case Network.DEVNET:
                const aptosConfig = new AptosConfig({ network: Network.DEVNET });
                link = new Aptos(aptosConfig);
                break;

            default:

                break;
        }
        return ck && ck(link);
    },
    height:(network,ck)=>{
        self.init(network,(aptos)=>{
            aptos.getLedgerInfo().then((res)=>{
                return ck && ck(res);
            }).catch((error) => {
                return ck && ck(error);
            });
        });
    },
    generate:(ck,seed)=>{
        const acc = Account.generate();
        return ck && ck(acc);
    },
    wallet:(ck)=>{
       
    },
    contact:(from,hash,data, ck, network)=>{
        self.init(network,async (aptos)=>{
            const alice=from;         //from account
            //const bobAddress={};    //to account

            // build a transaction
            const transaction = await aptos.transaction.build.simple({
                sender: alice.accountAddress,
                data: {
                    function: `${hash}::birds_nft::mint`,    
                    functionArguments: [data.content, hash],   //传给合约的信息
                    //functionArguments: [bobAddress, 100],
                    //typeArguments: ["0x1::aptos_coin::AptosCoin"],
                },
            });
            
            // using sign and submit separately
            const senderAuthenticator = aptos.transaction.sign({
                signer: alice,
                transaction,
            });

            const committedTransaction = await aptos.transaction.submit.simple({
                transaction,
                senderAuthenticator,
            });
            return ck && ck(committedTransaction);
        });
    },
    run: (program_id, param, ck, network) => {

    },
    airdrop: (target, amount, ck, network) => {
        // const transaction = await aptos.fundAccount({
        //     accountAddress: account.accountAddress,
        //     amount: 100,
        // });
    },
    view:(hash,type,ck,network)=>{
        self.init(network,(aptos)=>{
            const param={ accountAddress:hash };
            switch (type) {
                case 'account':
                    aptos.getAccountInfo(param).then((obj)=>{
                        return ck && ck(obj);
                    }).catch((error) => {
                        return ck && ck(error);
                    });
                    break;
                
                case 'transaction':
                    aptos.getAccountTransactions(param).then((obj)=>{
                        return ck && ck(obj);
                    }).catch((error) => {
                        return ck && ck(error);
                    });
                    break;
                case 'token':
                    aptos.getAccountOwnedTokens(param).then((obj)=>{
                        return ck && ck(obj);
                    }).catch((error) => {
                        return ck && ck(error);
                    });
                    break;
                default:
                    break;
            }
        });
    },
};

export default self;