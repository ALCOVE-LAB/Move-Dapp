import { MoveResource } from "aptos/src/generated";
import { useRecoilValue } from "recoil";
import useSWR from "swr";

import { FT_SWAP_ADDRESSES } from "@/constants/contracts";
import { networkState } from "@/recoil/network";
import { INFTPairMetadata } from "@/types/nftpair";

import useAptosClient from "./useAptosClient";
import useAptosWallet from "./useAptosWallet";

export default function useNFTPairMetadata({
  handleString,
  serialNum,
  refreshInterval,
}: {
  handleString?: string;
  serialNum?: string;
  refreshInterval?: number;
}) {
  const aptosClient = useAptosClient();
  const { activeWallet } = useAptosWallet();

  const walletAddress = activeWallet?.toString();
  const { network } = useRecoilValue(networkState);
  const poolId =
    walletAddress && serialNum && typeof serialNum === "string"
      ? {
          creator: walletAddress,
          serialNum: serialNum.toString(),
        }
      : null;

  return useSWR<INFTPairMetadata, unknown>(
    handleString && poolId && serialNum ? [handleString, serialNum] : undefined,
    () =>
      aptosClient.getTableItem(handleString!, {
        key_type: `${FT_SWAP_ADDRESSES[network]}::pair_factory::PoolId`,
        value_type: `${FT_SWAP_ADDRESSES[network]}::pair_factory::PoolMetadata<0x3::token::TokenStore, 0x1::aptos_coin::AptosCoin>`,
        key: poolId,
      }),
    { refreshInterval: handleString && refreshInterval ? refreshInterval : 0 }
  );
}
