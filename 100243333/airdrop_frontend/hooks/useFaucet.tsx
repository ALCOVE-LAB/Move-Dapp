import { useWallet } from "@manahippo/aptos-wallet-adapter";
import { Types } from "aptos";
import { PendingTransaction } from "aptos/src/generated";
import { useCallback, useMemo, useState } from "react";

import useAptosClient from "./useAptosClient";
import useAptosWallet from "./useAptosWallet";

export default function useFaucet(
  payload?: Types.TransactionPayload_EntryFunctionPayload
) {
  const [pendingTx, setPendingTx] = useState<PendingTransaction>();
  const [tx, setTx] = useState<Types.Transaction>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>();
  const aptosClient = useAptosClient();
  const { activeWallet } = useAptosWallet();
  const { signAndSubmitTransaction } = useWallet();

  const mutate = useCallback(async () => {
    if (!activeWallet) {
      setError(new Error("Unknown wallet"));
      return;
    }
    if (!payload) {
      setError(new Error("Invalid transition payload"));
      return;
    }
    try {
      setError(undefined);
      setPending(true);
      const pendingTx = await signAndSubmitTransaction(payload);
      console.log("Faucet pendingTx", pendingTx);
      setPendingTx(pendingTx as PendingTransaction);
      const _tx = await aptosClient.waitForTransactionWithResult(
        pendingTx.hash,
        { checkSuccess: true }
      );
      setTx(_tx);
      setPendingTx(undefined);
      setPending(false);
    } catch (error) {
      setPending(false);
      setError(error);
    }
  }, [activeWallet, aptosClient, payload, signAndSubmitTransaction]);

  return useMemo(() => {
    return {
      tx,
      pendingTx,
      pending,
      error,
      mutate,
    };
  }, [error, mutate, pending, pendingTx, tx]);
}
