import { MaybeHexString } from "aptos";
import { MoveResource } from "aptos/src/generated";
import useSWR from "swr";

import useAptosClient from "./useAptosClient";

export default function usePoolNums(
  address: MaybeHexString,
  refreshInterval?: number
) {
  const aptosClient = useAptosClient();
  const resourceType = `${address}::pair_factory::CreatorOwnPool`;
  return useSWR<MoveResource, unknown>(
    address && resourceType ? [address, resourceType] : undefined,
    () => aptosClient.getAccountResource(address!, resourceType),
    { refreshInterval: address && refreshInterval ? refreshInterval : 0 }
  );
}
