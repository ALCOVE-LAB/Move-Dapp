import { resolve } from "node:path";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";

import { FT_SWAP_ADDRESSES } from "@/constants/contracts";
import { networkState } from "@/recoil/network";
import { INFTPairMetadata } from "@/types/nftpair";

import useAptosClient from "./useAptosClient";
import useNFTMetadataHandle from "./useNFTMetadataHandle";

export default function useAllPoolsForPublic(poolsLength = 11) {
  const { network } = useRecoilValue(networkState);

  const walletAddress =
    "0xd713cb58a66c0bf20e09a83a8e13f08459089f00136b80f774251ce9d8948e8c";

  const serialNums = useMemo(() => {
    if (!poolsLength || !+poolsLength) return [];
    const res = [];
    for (let index = 1; index <= +poolsLength; index++) {
      res.push(index);
    }
    return res;
  }, [poolsLength]);

  const { data: NFTMetadataHandleData } = useNFTMetadataHandle(
    FT_SWAP_ADDRESSES[network],
    10_000
  );

  const handleString = useMemo(
    () => (NFTMetadataHandleData?.data as any)?.pools?.inner?.handle,
    [NFTMetadataHandleData?.data]
  );

  const [data, setData] = useState<INFTPairMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>();

  const aptosClient = useAptosClient();
  const promiseList = useMemo(() => {
    const res: Array<Promise<INFTPairMetadata>> = [];
    for (const serialNum of serialNums) {
      const poolId =
        walletAddress &&
        serialNum &&
        typeof serialNum === "number" &&
        handleString
          ? {
              creator: walletAddress,
              serialNum: `${serialNum}`,
            }
          : null;
      const promiseItem =
        poolId && network && FT_SWAP_ADDRESSES[network]
          ? new Promise((resolve, reject) => {
              return aptosClient
                .getTableItem(handleString!, {
                  key_type: `${FT_SWAP_ADDRESSES[network]}::pair_factory::PoolId`,
                  value_type: `${FT_SWAP_ADDRESSES[network]}::pair_factory::PoolMetadata<0x3::token::TokenStore, 0x1::aptos_coin::AptosCoin>`,
                  key: poolId,
                })
                .then((res) =>
                  resolve({
                    ...res,
                    serialNum,
                  })
                )
                .catch(reject);
            })
          : undefined;
      if (promiseItem) {
        res.push(promiseItem as Promise<INFTPairMetadata>);
      }
    }
    return res;
  }, [aptosClient, handleString, network, serialNums, walletAddress]);

  const mutate = useCallback(async () => {
    if (promiseList.length === 0) return;
    setIsLoading(true);
    try {
      const data = await Promise.all(promiseList);
      setData(data);
    } catch (error) {
      setError(error);
    }
    setIsLoading(false);
  }, [promiseList]);

  const isDisabled = useMemo(() => {
    return (
      isLoading ||
      !handleString ||
      serialNums.length === 0 ||
      !network ||
      !FT_SWAP_ADDRESSES[network]
    );
  }, [handleString, isLoading, network, serialNums.length]);

  useEffect(() => {
    if (isLoading || isDisabled || data?.length > 0) return;
    mutate();
  }, [data, isDisabled, isLoading, mutate]);

  return useMemo(() => {
    return {
      data,
      isLoading,
      error,
      mutate,
    };
  }, [data, error, isLoading, mutate]);
}
