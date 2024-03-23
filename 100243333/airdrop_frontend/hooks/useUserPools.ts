import { useMemo } from "react";
import { useRecoilValue } from "recoil";

import { FT_SWAP_ADDRESSES } from "@/constants/contracts";
import { AllTokenPairsMappingState } from "@/recoil/allPools";
import { coinListMappingState } from "@/recoil/coinList";
import { networkState } from "@/recoil/network";
import { ITokenPair } from "@/types/aptos";

import useAccountResources from "./useAccountResources";
import useAptosWallet from "./useAptosWallet";

export default function useUserPools() {
  const { connected, activeWallet } = useAptosWallet();
  const { network } = useRecoilValue(networkState);
  const {
    data: resources,
    isValidating,
    error,
  } = useAccountResources(activeWallet);

  // const coinListMapping = useRecoilValue(coinListMappingState);

  const allTokenPairsMappingValue = useRecoilValue(AllTokenPairsMappingState);

  const res = useMemo(() => {
    if (!resources) return [];

    const tempTokenPairMapping: Record<string, ITokenPair> = {};
    for (const resource of resources) {
      if (/linear_swap::LPToken<(.*),\s?(.*)>>$/.test(resource.type)) {
        const [_, xCoinType, yCoinType] =
          resource.type.match(/linear_swap::LPToken<(.*),\s?(.*)>>$/) || [];

        if (!tempTokenPairMapping[`${xCoinType},${yCoinType}`]) {
          tempTokenPairMapping[`${xCoinType},${yCoinType}`] = {};
        }
        tempTokenPairMapping[`${xCoinType},${yCoinType}`].userLPToken =
          resource;

        if (allTokenPairsMappingValue[`${xCoinType},${yCoinType}`]) {
          tempTokenPairMapping[`${xCoinType},${yCoinType}`].xCoin =
            allTokenPairsMappingValue[`${xCoinType},${yCoinType}`].xCoin;
          tempTokenPairMapping[`${xCoinType},${yCoinType}`].yCoin =
            allTokenPairsMappingValue[`${xCoinType},${yCoinType}`].yCoin;
          tempTokenPairMapping[`${xCoinType},${yCoinType}`].LPToken =
            allTokenPairsMappingValue[`${xCoinType},${yCoinType}`].LPToken;
        }
        // if (
        //   coinListMapping[xCoinType] &&
        //   !tempTokenPairMapping[`${xCoinType},${yCoinType}`].xCoin
        // ) {
        //   tempTokenPairMapping[`${xCoinType},${yCoinType}`].xCoin =
        //     coinListMapping[xCoinType];
        // }
        // if (
        //   coinListMapping[yCoinType] &&
        //   !tempTokenPairMapping[`${xCoinType},${yCoinType}`].yCoin
        // ) {
        //   tempTokenPairMapping[`${xCoinType},${yCoinType}`].yCoin =
        //     coinListMapping[yCoinType];
        // }
      }
    }

    const res: ITokenPair[] = Object.values(tempTokenPairMapping);
    return res;
  }, [allTokenPairsMappingValue, resources]);

  return res;
}
