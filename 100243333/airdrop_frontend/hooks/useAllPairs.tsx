import { useEffect, useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { FT_SWAP_ADDRESSES } from "@/constants/contracts";
import { allPoolsState } from "@/recoil/allPools";
import { coinListMappingState } from "@/recoil/coinList";
import { networkState } from "@/recoil/network";
import { ITokenPair, TokenPairMetadata } from "@/types/aptos";

import useAccountResources from "./useAccountResources";

export default function useAllPairs() {
  const { network } = useRecoilValue(networkState);
  const [allPoolsPairs, setAllPoolsPairs] = useRecoilState(allPoolsState);
  const {
    data: resources,
    isValidating,
    error,
  } = useAccountResources(FT_SWAP_ADDRESSES[network], 10_000);

  const coinListMapping = useRecoilValue(coinListMappingState);

  const validCoinPairs = useMemo(() => {
    if (!resources) return [];

    const tempTokenPairMapping: Record<string, ITokenPair> = {};
    for (const resource of resources) {
      if (
        /linear_swap::LPToken<(.*),\s?(.*)>>$/.test(resource.type) &&
        (resource.data as any).symbol
      ) {
        const [_, xCoinType, yCoinType] =
          resource.type.match(/linear_swap::LPToken<(.*),\s?(.*)>>$/) || [];

        if (!tempTokenPairMapping[`${xCoinType},${yCoinType}`]) {
          tempTokenPairMapping[`${xCoinType},${yCoinType}`] = {};
        }
        tempTokenPairMapping[`${xCoinType},${yCoinType}`].LPToken = resource;
        if (
          coinListMapping[xCoinType] &&
          !tempTokenPairMapping[`${xCoinType},${yCoinType}`].xCoin
        ) {
          tempTokenPairMapping[`${xCoinType},${yCoinType}`].xCoin =
            coinListMapping[xCoinType];
        }
        if (
          coinListMapping[yCoinType] &&
          !tempTokenPairMapping[`${xCoinType},${yCoinType}`].yCoin
        ) {
          tempTokenPairMapping[`${xCoinType},${yCoinType}`].yCoin =
            coinListMapping[yCoinType];
        }
        // if (
        //   xCoinType &&
        //   coinListMapping[xCoinType] &&
        //   yCoinType &&
        //   coinListMapping[yCoinType] &&
        //   (resource.data as any).symbol
        // ) {
        //   // console.log(resource);
        //   // res.push({
        //   //   xCoin: coinListMapping[xCoinType],
        //   //   yCoin: coinListMapping[yCoinType],
        //   //   LPResource: resource,
        //   // });
        // }
      } else if (
        /linear_swap::TokenPairMetadata<(.*),\s?(.*)>$/.test(resource.type)
      ) {
        const [_, xCoinType, yCoinType] =
          resource.type.match(
            /linear_swap::TokenPairMetadata<(.*),\s?(.*)>$/
          ) || [];

        if (!tempTokenPairMapping[`${xCoinType},${yCoinType}`]) {
          tempTokenPairMapping[`${xCoinType},${yCoinType}`] = {};
        }
        tempTokenPairMapping[`${xCoinType},${yCoinType}`].tokenPairMetadata =
          resource as {
            data: TokenPairMetadata;
            type: string;
          };
        if (
          coinListMapping[yCoinType] &&
          !tempTokenPairMapping[`${xCoinType},${yCoinType}`].yCoin
        ) {
          tempTokenPairMapping[`${xCoinType},${yCoinType}`].yCoin =
            coinListMapping[yCoinType];
        }
      }
    }

    const res: ITokenPair[] = Object.values(tempTokenPairMapping);
    return res;
  }, [coinListMapping, resources]);

  useEffect(() => {
    setAllPoolsPairs(validCoinPairs);
  }, [setAllPoolsPairs, validCoinPairs]);
  return allPoolsPairs;
}
