import { Types } from "aptos";
import { PendingTransaction } from "aptos/src/generated";
import { useCallback, useMemo, useState } from "react";

import useAdminAccount from "./useAdminAccount";
import useAptosClient from "./useAptosClient";

export default function useCreatePoolByAdmin(
  payload?: Types.TransactionPayload_EntryFunctionPayload
) {
  const [pendingTx, setPendingTx] = useState<PendingTransaction>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>();
  const aptosClient = useAptosClient();
  const adminAccount = useAdminAccount();

  const mutate = useCallback(async () => {
    if (!adminAccount || !payload) {
      setError(new Error("Invalid admin account"));
      return;
    }
    try {
      setError(undefined);
      setPending(true);
      const txn_request = await aptosClient.generateTransaction(
        adminAccount.address(),
        payload,
        { max_gas_amount: "2000" }
      );
      const signed_txn = await aptosClient.signTransaction(
        adminAccount,
        txn_request
      );
      const transaction = await aptosClient.submitTransaction(signed_txn);
      setPendingTx(transaction);
      await aptosClient.waitForTransaction(transaction.hash);
      setPending(false);
    } catch (error) {
      setError(error);
    }
  }, [adminAccount, aptosClient, payload]);

  return useMemo(() => {
    return {
      pendingTx,
      pending,
      error,
      mutate,
    };
  }, [error, mutate, pending, pendingTx]);
}
