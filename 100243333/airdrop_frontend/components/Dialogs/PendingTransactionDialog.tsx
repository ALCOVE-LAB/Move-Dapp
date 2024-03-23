import { DocumentDuplicateIcon } from "@heroicons/react/24/solid";
import { Types } from "aptos";
import { PendingTransaction, UserTransaction } from "aptos/src/generated";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCopyToClipboard } from "react-use";
import useSWR from "swr";

import useAptosClient from "@/hooks/useAptosClient";

import Tooltip from "../base/Tooltip";
import Modal from "../Modal";

interface Props {
  pendingTx?: PendingTransaction;
  onDismiss: () => void;
}
export default function PendingTransactionDialog({
  pendingTx,
  onDismiss,
}: Props) {
  const [loop, setLoop] = useState(false);

  const { data, isValidating, error, mutate } = useSWR<
    Types.Transaction | UserTransaction,
    unknown
  >(
    pendingTx?.hash ? pendingTx.hash : undefined,
    () =>
      aptosClient.waitForTransactionWithResult(pendingTx!.hash, {
        checkSuccess: true,
      }),
    { refreshInterval: loop ? 5000 : 0 }
  );

  const isPending = !data && !error;
  const isSuccess = (data as UserTransaction)?.success;

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (pendingTx) {
      setIsOpen(true);
      setLoop(true);
      mutate();
    } else {
      setIsOpen(false);
      setLoop(false);
    }
  }, [mutate, pendingTx]);

  useEffect(() => {
    if (!isPending) {
      setLoop(false);
    }
  }, [isPending]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Succeed to add liquidity");
    }
  }, [isSuccess]);

  const aptosClient = useAptosClient();

  const [_, copyToClipboard] = useCopyToClipboard();

  const onCopyHash = useCallback(() => {
    if (!pendingTx?.hash) {
      return;
    }
    copyToClipboard(pendingTx?.hash);
    toast.success("Transaction hash has been copied");
  }, [copyToClipboard, pendingTx?.hash]);

  return (
    <Modal
      title="Adding Liquidity"
      minHeight="0px"
      maxWidth="400px"
      isOpen={isOpen}
      onDismiss={() => {
        setIsOpen(false);
        setTimeout(() => onDismiss(), 300);
      }}
    >
      <div className="flex h-[200px] w-full flex-col items-center justify-center py-5">
        {isPending ? (
          // <div className="border-top-primary mb-5 h-16 w-16 animate-spin rounded-full border-4 border-slate-200"></div>
          <div className="mb-5 h-16 w-16 animate-bounce rounded-lg bg-primary/70"></div>
        ) : isSuccess ? (
          <div className="mb-5 h-16 w-16 animate-none rounded-lg bg-green-500/70"></div>
        ) : (
          <div className="mb-5 h-16 w-16 animate-pulse rounded-lg bg-rose-500/70"></div>
        )}
        <div className="flex items-center justify-center space-x-2 text-sm">
          <a
            href={`https://testnet.aptoscan.com/version/${pendingTx?.hash}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 underline underline-offset-4"
          >
            Check transaction on aptos scan
          </a>
          <Tooltip text="Copy">
            <button
              type="button"
              className="inline-block text-blue-500 hover:text-blue-600"
              onClick={onCopyHash}
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>

        {isSuccess && (
          <button
            type="button"
            className="mt-4 inline-flex min-w-[120px] items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => {
              setIsOpen(false);
              setTimeout(() => onDismiss(), 300);
            }}
          >
            Close
          </button>
        )}
      </div>
    </Modal>
  );
}
