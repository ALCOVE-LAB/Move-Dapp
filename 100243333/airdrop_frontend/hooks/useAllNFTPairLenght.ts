import { MoveResource } from "aptos/src/generated";
import useSWR from "swr";

import { ADMIN_ACCOUNT_DATA } from "@/constants/misc";

import useAptosClient from "./useAptosClient";

export default function useAllNFTPairLength(refreshInterval?: number) {
  const aptosClient = useAptosClient();
  const { address: adminAddress } = ADMIN_ACCOUNT_DATA;

  const handleType = adminAddress
    ? `${adminAddress}::pair_factory::NFTPairMetadata<0x3::token::TokenStore, 0x1::aptos_coin::AptosCoin>`
    : undefined;
  const { data } = useSWR<MoveResource, unknown>(
    adminAddress ?? undefined,
    () => aptosClient.getAccountResource(adminAddress!, handleType!),
    { refreshInterval: handleType && refreshInterval ? refreshInterval : 0 }
  );
  const length = (data?.data as any)?.pools?.length;
  console.log(1234, length);
  return length;
  // return useSWR<MoveResource, unknown>(
  //   handleString && activeWallet?.toString() ? handleString : undefined,
  //   () =>
  //     aptosClient.getTableItem(handleString!, {
  //       key_type: "address",
  //       value_type: "u64",
  //       key: activeWallet?.toString(),
  //     }),
  //   { refreshInterval: handleString && refreshInterval ? refreshInterval : 0 }
  // );
}
