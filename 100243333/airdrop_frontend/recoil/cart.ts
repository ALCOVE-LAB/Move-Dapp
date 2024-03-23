import { BigNumber } from "@ethersproject/bignumber";
import { TokenTypes } from "aptos";
import { atom, selector } from "recoil";

import { ZERO } from "@/constants/misc";

export interface ICartItem {
  tokenId: TokenTypes.TokenId;
  price: BigNumber;
  image?: string;
}

interface CartState {
  isOpen: boolean;
  items: ICartItem[];
}

export const cartState = atom({
  key: "Wallet",
  default: {
    isOpen: false,
    items: [],
  } as CartState,
});

export const cartTotalPrice = selector({
  key: "cartTotalPrice",
  get: ({ get }) => {
    let res = ZERO;
    for (const item of get(cartState).items) {
      res = res.add(item.price);
    }
    return res;
  },
});
