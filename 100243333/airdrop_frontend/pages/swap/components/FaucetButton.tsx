import { Types } from "aptos";
import { ReactNode, useCallback, useEffect } from "react";
import toast from "react-hot-toast";

import useFaucet from "@/hooks/useFaucet";
import { getErrMsg } from "@/lib/error";

interface FaucetButtonProps {
  text: ReactNode;
  payload: Types.TransactionPayload_EntryFunctionPayload;
}

export default function FaucetButton({ text, payload }: FaucetButtonProps) {
  const { pendingTx, pending, tx, error, mutate } = useFaucet(payload);
  useEffect(() => {
    if (error) {
      toast.error(getErrMsg(error));
    } else {
      let toastId: any = null;
      if (pendingTx) {
        toastId = toast.loading("Transaction is pending...");
      }
      if (tx) {
        toast.dismiss(toastId);
        toast.success("Claim transaction is completed", {
          duration: 10_000,
        });
      }
    }
  }, [error, pendingTx, tx]);
  return (
    <button
      disabled={pending}
      className={`inline-flex items-center rounded border border-transparent bg-indigo-100 px-2.5 py-1.5 text-xs font-medium text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        pending
          ? "cursor-wait opacity-50"
          : "cursor-pointer hover:bg-indigo-200"
      }`}
      onClick={() => {
        mutate();
      }}
    >
      {text}
    </button>
  );
}
