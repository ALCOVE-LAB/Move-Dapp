import { useMemo } from "react";
import { useRecoilValue } from "recoil";
import useSWR from "swr";

import { networkState } from "@/recoil/network";
import { Network } from "@/types/misc";

import useAptosWallet from "./useAptosWallet";

export interface ITokenOwnerShip {
  amount: number;
  collection_name: string;
  name: string;
  property_version: number;
  table_type: string;
  token_data_id_hash: string;
}

export type OwnerTokens = Array<ITokenOwnerShip>;

export interface IOwnerCollection {
  name: string;
  tokens: OwnerTokens;
}

export type UserNFTsData = {
  [name: string]: IOwnerCollection;
};

const fetcher = ({ url, walletAddress }: any) => {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operationName: "AccountTokensData",
      variables: {
        owner_address: walletAddress,
        limit: 100,
        offset: 0,
      },
      query:
        'query AccountTokensData($owner_address: String, $limit: Int, $offset: Int) {\n  current_token_ownerships(\n    where: {owner_address: {_eq: $owner_address}, amount: {_gt: "0"}}\n    limit: $limit\n    offset: $offset\n  ) {\n    token_data_id_hash\n    name\n    collection_name\n    table_type\n    property_version\n    amount\n    __typename\n  }\n}',
    }),
  }).then((r) => r.json());
};

export default function useUserNFTs() {
  const { activeWallet } = useAptosWallet();
  const { network } = useRecoilValue(networkState);
  const url =
    network === Network.Testnet
      ? "https://indexer-testnet.staging.gcp.aptosdev.com/v1/graphql"
      : "";
  const walletAddress = activeWallet?.toString();

  const key = url && walletAddress ? { url, walletAddress } : undefined;
  const { data, ...rest } = useSWR(key, fetcher, {
    refreshInterval: 10_000,
  });

  const current_token_ownerships = data?.data
    ?.current_token_ownerships as OwnerTokens;

  const nftData = useMemo(() => {
    // eslint-disable-next-line unicorn/no-array-reduce
    return (current_token_ownerships || []).reduce((state, curr) => {
      const { collection_name } = curr;
      const prevCollectionData: IOwnerCollection = state[collection_name]
        ? state[collection_name]
        : {
            name: collection_name,
            tokens: [] as OwnerTokens,
          };

      const collectionData = {
        ...prevCollectionData,
        tokens: [...prevCollectionData.tokens, curr],
      };
      return {
        ...state,
        [collection_name]: collectionData,
      };
    }, {} as UserNFTsData);
  }, [current_token_ownerships]);

  return {
    data: nftData,
    ...rest,
  };
}
