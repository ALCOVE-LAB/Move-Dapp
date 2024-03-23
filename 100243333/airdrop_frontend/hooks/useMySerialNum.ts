import { MoveResource } from "aptos/src/generated";
import useSWR from "swr";

import useAptosClient from "./useAptosClient";
import useAptosWallet from "./useAptosWallet";

export default function useMySerialNum(
  handleString?: string,
  refreshInterval?: number
) {
  const aptosClient = useAptosClient();
  const { activeWallet } = useAptosWallet();

  return useSWR<MoveResource, unknown>(
    handleString && activeWallet?.toString() ? handleString : undefined,
    () =>
      aptosClient.getTableItem(handleString!, {
        key_type: "address",
        value_type: "u64",
        key: activeWallet?.toString(),
      }),
    { refreshInterval: handleString && refreshInterval ? refreshInterval : 0 }
  );
}
