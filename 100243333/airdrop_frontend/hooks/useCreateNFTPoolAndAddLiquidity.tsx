import { useWallet } from "@manahippo/aptos-wallet-adapter";
import { Types } from "aptos";
import { PendingTransaction } from "aptos/src/generated";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useRecoilValue } from "recoil";

import { FT_SWAP_ADDRESSES } from "@/constants/contracts";
import { getCreatedPairMetadata } from "@/lib/getCreatedPairMetadata";
import { networkState } from "@/recoil/network";

import useAdminAccount from "./useAdminAccount";
import useAptosClient from "./useAptosClient";
import useAptosWallet from "./useAptosWallet";

export default function useCreateNFTPoolAndAddLiquidity(
  payload?: Types.TransactionPayload_EntryFunctionPayload,
  addLiquidityPayload?: Types.TransactionPayload_EntryFunctionPayload
) {
  const [pendingTx, setPendingTx] = useState<PendingTransaction>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>();
  const aptosClient = useAptosClient();
  const adminAccount = useAdminAccount();
  const { activeWallet } = useAptosWallet();
  const { signAndSubmitTransaction } = useWallet();

  const { network } = useRecoilValue(networkState);
  const router = useRouter();
  const mutate = useCallback(async () => {
    if (!adminAccount || !payload || !addLiquidityPayload) {
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
      await aptosClient.waitForTransaction(transaction.hash, {
        checkSuccess: true,
      });
      const { serialNum } =
        (await getCreatedPairMetadata({
          aptosClient,
          indeedCreatorAddress: FT_SWAP_ADDRESSES[network],
          accountAddress: activeWallet?.toString(),
        })) || {};
      if (!serialNum) {
        throw new Error("Failed to get serialNum");
      }
      const indeedAddLiquidityPayload = Object.assign({}, addLiquidityPayload, {
        arguments: [+serialNum, ...addLiquidityPayload.arguments.slice(1)],
      });

      const pendingCreateNFTPair = await signAndSubmitTransaction(
        indeedAddLiquidityPayload
      );
      console.log("pendingCreateNFTPair", pendingCreateNFTPair, payload);
      const txn = await aptosClient.waitForTransactionWithResult(
        pendingCreateNFTPair.hash,
        { checkSuccess: true }
      );
      console.log("@@@ create NFT Pair", txn);
      toast.success("创建成功");
      router.replace(`/nft/pool/my`);
    } catch (error) {
      console.log(error);
      setError(error);
    }
    setPending(false);
  }, [
    activeWallet,
    addLiquidityPayload,
    adminAccount,
    aptosClient,
    network,
    payload,
    router,
    signAndSubmitTransaction,
  ]);

  return useMemo(() => {
    return {
      pendingTx,
      pending,
      error,
      mutate,
    };
  }, [error, mutate, pending, pendingTx]);
}
