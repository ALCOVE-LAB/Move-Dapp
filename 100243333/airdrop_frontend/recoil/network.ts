import { atom } from "recoil";

import { Network } from "@/types/misc";

export const networkState = atom({
  key: "Network",
  default: {
    network: Network.Testnet,
  } as {
    network: Network;
  },
});
