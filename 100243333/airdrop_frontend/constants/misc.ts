import { Network } from "@/types/misc";

export const REGEX_HTTPS_URL =
  /^https?:\/\/(www\.)?[\w#%+.:=@~-]{1,256}\.[\d()A-Za-z]{1,6}\b([\w#%&()+./:=?@~-]*)/;

export const MUNITE_SECONDS = 60;
export const HOUR_SECONDS = 3600;
export const DAY_SECONDS = 86_400;

export const AptosNodes = {
  [Network.Devnet]: "https://fullnode.devnet.aptoslabs.com/v1",
  [Network.Testnet]: "https://fullnode.testnet.aptoslabs.com/v1",
  [Network.Mainnet]: "https://fullnode.mainnet.aptoslabs.com/v1",
};

export const APTOS_COIN_TYPE = "0x1::aptos_coin::AptosCoin";

export const CoinListMapping = {
  [Network.Devnet]:
    "https://raw.githubusercontent.com/laptosio/asset_list/main/ft.testnet.json?network=devnet",
  [Network.Testnet]:
    "https://raw.githubusercontent.com/laptosio/asset_list/main/ft.testnet.json?network=testnet",
  [Network.Mainnet]:
    "https://raw.githubusercontent.com/laptosio/asset_list/main/ft.testnet.json?network=mainnet",
};

export const ADMIN_ACCOUNT_DATA = {
  privateKey: process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY,
  publicKey: process.env.NEXT_PUBLIC_ADMIN_PUBLIC_KEY,
  address: process.env.NEXT_PUBLIC_ADMIN_ADDRESS,
};

export const SWAP_FEE = 3;
export const SWAP_FEE_BASE = 1000; // 手续费 0.3%

export { Zero as ZERO } from "@ethersproject/constants";
export { MaxUint256 } from "@ethersproject/constants";

export const BASIC_DECIMALS = 8;
