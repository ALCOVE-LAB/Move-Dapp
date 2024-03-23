import { atom, selector } from "recoil";

import { ITokenPair } from "@/types/aptos";

type AllPoolsState = ITokenPair[];

export const allPoolsState = atom({
  key: "allPools",
  default: [] as AllPoolsState,
});

export const AllTokenPairsMappingState = selector({
  key: "allTokenPairsMapping",
  get: ({ get }) => {
    const items = get(allPoolsState);
    const initValue: { [key: string]: ITokenPair } = {};
    return (
      (items || [])
        .filter((item) =>
          Boolean(
            item.LPToken && item.tokenPairMetadata && item.xCoin && item.yCoin
          )
        )
        // eslint-disable-next-line unicorn/no-array-reduce
        .reduce((prevValue, currItem) => {
          return {
            ...prevValue,
            [`${currItem.xCoin!.token_type.type},${
              currItem.yCoin!.token_type.type
            }`]: currItem,
          };
        }, initValue)
    );
  },
});
