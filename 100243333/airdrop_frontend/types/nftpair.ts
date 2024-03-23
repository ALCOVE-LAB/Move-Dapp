import { BigNumberish } from "@ethersproject/bignumber";
import { TokenId } from "@martiandao/aptos-web3-bip44.js";

import { BondingCurve, PoolType } from "./nft";

export type ITokenId = TokenId[];

export interface INFTPairMetadata {
  assetRecipient: string;
  coin: {
    value: BigNumberish;
  };
  creator: string;
  curveType: BondingCurve;
  delta: BigNumberish;
  fee: BigNumberish;
  poolType: PoolType;
  spotPrice: BigNumberish;
  tokenIds: ITokenId;
  tokens: {
    inner: {
      handle: string;
    };
    length: `${number}`;
  };
  serialNum?: number;
}

// {
//   "assetRecipient": "0xd713cb58a66c0bf20e09a83a8e13f08459089f00136b80f774251ce9d8948e8c",
//   "coin": {
//       "value": "100000000"
//   },
//   "creator": "0xd713cb58a66c0bf20e09a83a8e13f08459089f00136b80f774251ce9d8948e8c",
//   "curveType": 1,
//   "delta": "10000000",
//   "fee": "0",
//   "poolType": 1,
//   "spotPrice": "100000000",
//   "tokenIds": [
//       {
//           "property_version": "0",
//           "token_data_id": {
//               "collection": "Apoodles",
//               "creator": "0xd713cb58a66c0bf20e09a83a8e13f08459089f00136b80f774251ce9d8948e8c",
//               "name": "Apoodles #120"
//           }
//       }
//   ],
//   "tokens": {
//       "inner": {
//           "handle": "0xabd5cce1b5c12a705c144a6edb3123a1f79ce7cd812690a0b6ac3b7940202bb6"
//       },
//       "length": "1"
//   }
// }
