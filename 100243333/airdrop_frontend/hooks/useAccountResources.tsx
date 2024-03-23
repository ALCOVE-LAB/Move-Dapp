import { MaybeHexString } from "aptos";
import { MoveResource } from "aptos/src/generated";
import useSWR from "swr";

import useAptosClient from "./useAptosClient";

export default function useAccountResources(
  accountAddress?: MaybeHexString,
  refreshInterval?: number
) {
  const aptosClient = useAptosClient();

  return useSWR<MoveResource[], unknown>(
    accountAddress ? accountAddress : undefined,
    () => aptosClient.getAccountResources(accountAddress!),
    { refreshInterval: accountAddress && refreshInterval ? refreshInterval : 0 }
  );
}
