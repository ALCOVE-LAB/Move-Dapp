import { AptosAccount } from "aptos";
import { useMemo } from "react";

import { ADMIN_ACCOUNT_DATA } from "@/constants/misc";

export default function useAdminAccount() {
  const { address, privateKey, publicKey } = ADMIN_ACCOUNT_DATA;
  const adminAccount = useMemo(
    () =>
      privateKey
        ? AptosAccount.fromAptosAccountObject({
            address: address,
            privateKeyHex: privateKey,
            publicKeyHex: publicKey,
          })
        : null,
    [address, privateKey, publicKey]
  );
  return adminAccount;
}
