import { AptosClient } from "aptos";
import { useRecoilValue } from "recoil";

import { AptosNodes } from "@/constants/misc";
import { networkState } from "@/recoil/network";

function useAptosClient() {
  const { network } = useRecoilValue(networkState);
  return new AptosClient(AptosNodes[network]);
}

export default useAptosClient;
