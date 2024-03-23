import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { TokenId } from "@martiandao/aptos-web3-bip44.js";
import { TokenTypes, Types } from "aptos";

import { ICoinInfo } from "./misc";
import { INFTPairMetadata } from "./nftpair";

export interface ICollection {
  name: string;
  type: string;
  coverImage?: string;
  listing: number;
  floorPrice?: string;
  bestOffer?: string;
  offerTVL?: string;
  volumn?: string;
  items?: Array<
    INFTPairMetadata & {
      image?: string;
    }
  >;
}

export enum CreatePoolStep {
  SelectType,
  SelectAssets,
  ConfiguringPoolParameters,
  FinalizingDeposit,
}

export enum PoolType {
  Token = 1, // buy
  NFT, // sell
  Trade, // trading
}

export enum BondingCurve {
  Linear = 1,
  Exponential,
}

export interface CoinAmount {
  coin?: ICoinInfo;
  amount?: {
    displayed: string;
    value: BigNumber;
  };
}

export interface MarketPlaceCollectionTokenItem {
  tokenId: TokenTypes.TokenId;
  price: {
    displayed: string;
    value: BigNumber;
  };
  image: string;
}

export interface MarketPlaceCollection {
  name: string;
  creator: string;
  image: string;
  items: MarketPlaceCollectionTokenItem[];
}

export interface ICollectionItem extends TokenId {
  name: string;
  image: string;
  price: BigNumber;
}
