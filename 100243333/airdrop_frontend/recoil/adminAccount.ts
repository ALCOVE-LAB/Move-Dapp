import { MoveResource } from "aptos/src/generated";
import { atom } from "recoil";

interface AdminAccountState {
  resources: MoveResource[];
}

export const adminAccountState = atom({
  key: "adminAccount",
  default: {
    resources: [],
  } as AdminAccountState,
});
