import { AptosAccount, AptosAccountObject, HexString } from "aptos";
import { MoveResource } from "aptos/src/generated";

import { ICoinInfo } from "./misc";

export type AptosAccountState = AptosAccount | undefined;

export type ActiveAptosWallet = HexString | undefined;

export type AptosWalletObject = {
  walletName: string;
  aptosAccountObj: AptosAccountObject;
};

export const MessageMethod = Object.freeze({
  GET_ACCOUNT_ADDRESS: "getAccountAddress",
  SIGN_TRANSACTION: "signTransaction",
} as const);

export interface GetAccountResourcesProps {
  address?: string;
  nodeUrl?: string;
}

export interface AccountCoinBalance {
  [key: string]: {
    balance?: string;
    displayed?: string;
  };
}

// export interface ITokenPair {
//   xCoin: ICoinInfo;
//   yCoin: ICoinInfo;
//   LPResource: MoveResource;
// }

export interface TokenPairMetadata extends MoveResource {
  creator: string;
  fee_on: boolean;
  k_last: string;
  balance_x: {
    value: string;
  };
  balance_y: {
    value: string;
  };
}

export interface ITokenPair {
  xCoin?: ICoinInfo;
  yCoin?: ICoinInfo;
  LPToken?: MoveResource;
  userLPToken?: MoveResource;
  tokenPairMetadata?: {
    data: TokenPairMetadata;
  };
}
