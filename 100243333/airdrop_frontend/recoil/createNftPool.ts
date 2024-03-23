import { BigNumber } from "@ethersproject/bignumber";
import { TokenTypes } from "aptos";
import { atom } from "recoil";

import { ICoinInfo } from "@/types/misc";
import { BondingCurve, CoinAmount, PoolType } from "@/types/nft";

export interface ICartItem {
  tokenId: TokenTypes.TokenId;
  price: string;
}

interface CreateNftPoolData {
  poolType?: PoolType;
  xType?: string;
  yCoin?: ICoinInfo;
  spotPrice?: CoinAmount;
  bondingCurve?: BondingCurve;
  delta?: BigNumber;
  fee?: BigNumber;
  buyCount?: number;
  sellCount?: number;
  buyAmount?: BigNumber;
  sellAmount?: BigNumber;
}

export const cartState = atom({
  key: "Wallet",
  default: {
    poolType: undefined,
    xType: undefined,
    yCoin: undefined,
    spotPrice: undefined,
    bondingCurve: undefined,
    delta: undefined,
    fee: undefined,
    buyCount: undefined,
    sellCount: undefined,
    buyAmount: undefined,
    sellAmount: undefined,
  } as CreateNftPoolData,
});
