import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { CustomEndpoints, Network, Provider} from "aptos";
import { Network as AptosNetwork } from "@aptos-labs/ts-sdk"

const RANDOMNET: CustomEndpoints = {
    fullnodeUrl: "",
    indexerUrl: ""
}
export const network =
  import.meta.env.VITE_APP_NETWORK === "devnet"
    ? Network.DEVNET
    : import.meta.env.VITE_APP_NETWORK === "testnet"
    ? Network.TESTNET
    : import.meta.env.VITE_APP_NETWORK === "mainnet"
    ? Network.MAINNET
    : import.meta.env.VITE_APP_NETWORK === "randomnet"
    ? RANDOMNET
    : Network.LOCAL;
export const aptosNetwork =
    import.meta.env.VITE_APP_NETWORK === "devnet"
    ? AptosNetwork.DEVNET
    : import.meta.env.VITE_APP_NETWORK === "testnet"
    ? AptosNetwork.TESTNET
    : import.meta.env.VITE_APP_NETWORK === "mainnet"
    ? AptosNetwork.MAINNET
    : import.meta.env.VITE_APP_NETWORK === "randomnet"
    ? AptosNetwork.RANDOMNET
    : AptosNetwork.LOCAL;
export const provider = new Provider(network);
export const aptos = new Aptos(new AptosConfig({ network: aptosNetwork }));
