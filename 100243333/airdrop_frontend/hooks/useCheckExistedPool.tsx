import { MoveResource } from "aptos/src/generated";
import { useMemo, useState } from "react";
import { useRecoilValue } from "recoil";

import { FT_SWAP_ADDRESSES } from "@/constants/contracts";
import { networkState } from "@/recoil/network";

import useAccountResources from "./useAccountResources";

export default function useCheckExistedPool(
  xCoinType?: string,
  yCoinType?: string
) {
  const { network } = useRecoilValue(networkState);
  const {
    data: resources,
    isValidating,
    error,
  } = useAccountResources(
    xCoinType && yCoinType ? FT_SWAP_ADDRESSES[network] : undefined
  );

  const data = useMemo(() => {
    if (!resources) return undefined;
    const expectedLPType =
      FT_SWAP_ADDRESSES[network] &&
      xCoinType &&
      yCoinType &&
      xCoinType !== yCoinType
        ? `0x1::coin::CoinInfo<${FT_SWAP_ADDRESSES[network]}::linear_swap::LPToken<${xCoinType}, ${yCoinType}>>`
        : undefined;
    return resources.find((s) => s.type === expectedLPType);
  }, [network, resources, xCoinType, yCoinType]);

  return useMemo(() => {
    return {
      data,
      isValidating,
      error,
    };
  }, [data, error, isValidating]);
}
