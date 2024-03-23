import { atom, selector } from "recoil";

import { ICoinInfo } from "@/types/misc";

interface CoinListState {
  isOpen: boolean;
  items: ICoinInfo[];
}

export const coinListState = atom({
  key: "coinsList",
  default: {
    isOpen: false,
    items: [],
  } as CoinListState,
});

export const coinListMappingState = selector({
  key: "coinListMapping",
  get: ({ get }) => {
    const { items } = get(coinListState);
    const initValue: { [key: string]: ICoinInfo } = {};
    // eslint-disable-next-line unicorn/no-array-reduce
    return (items || []).reduce((prevValue, currItem) => {
      return {
        ...prevValue,
        [currItem.token_type.type]: currItem,
      };
    }, initValue);
  },
});
