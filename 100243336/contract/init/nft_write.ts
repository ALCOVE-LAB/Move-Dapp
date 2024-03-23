import { Ed25519PrivateKey, InputViewRequestData, Account, AccountAddress, Aptos, AptosConfig, Network, NetworkToNetworkName, Hex } from "@aptos-labs/ts-sdk";

const Contract = "xxxxxxxxxxxxxxx"

// Setup the client
const APTOS_NETWORK: Network = Network.LOCAL;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

const start_buy = async () => {

    const admin = Account.fromPrivateKey({
        privateKey: new Ed25519PrivateKey(Contract),
    });
    const transaction = await aptos.transaction.build.simple({
        sender: admin.accountAddress,
        data: {
            function: `${Contract}::nft::update_config`,
            functionArguments: [true, 2],
        },
    });
    const pendingTransaction = await aptos.signAndSubmitTransaction({
        signer: admin,
        transaction,
    });
    console.log("pendingTransaction ", pendingTransaction);
    await aptos.waitForTransaction({ transactionHash: pendingTransaction.hash });
    console.log("Transaction done", pendingTransaction);

    const payload: InputViewRequestData = {
        function: `${Contract}::nft::get_config_state_price`,
        functionArguments: [admin.accountAddress.toString()],
    };
    const result = await aptos.view({ payload });
    console.log("Out: ", result);
};

start_buy();
