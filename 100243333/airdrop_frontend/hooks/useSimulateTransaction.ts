import { AccountKeys } from "@manahippo/aptos-wallet-adapter";
import { AptosAccount, AptosClient, TxnBuilderTypes, Types } from "aptos";
import { EntryFunctionPayload, UserTransaction } from "aptos/src/generated";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useInterval } from "react-use";
import useSWR from "swr";

import { getErrMsg } from "@/lib/error";

import useAptosClient from "./useAptosClient";

const fetcher =
  (aptosClient: AptosClient) =>
  ({
    accountFrom,
    payload,
  }: {
    accountFrom?: any;
    payload: EntryFunctionPayload;
  }) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!accountFrom || !payload) {
          return reject(new Error("invalid args for simulation"));
        }
        const rawTxn: TxnBuilderTypes.RawTransaction =
          await aptosClient.generateTransaction(accountFrom.address, payload);

        console.log("@@@@@@", {
          accountFrom,
          payload,
          rawTxn,
        });
        const res = await aptosClient.simulateTransaction(
          accountFrom.publicKey,
          rawTxn
        );
        resolve(res);
      } catch (error) {
        reject(error);
      }
    });
  };

export default function useSimulateTransaction(
  accountFrom?: any,
  payload?: EntryFunctionPayload,
  refreshInterval?: number
) {
  const aptosClient = useAptosClient();

  const { data, isValidating, error } = useSWR(
    accountFrom && payload && aptosClient
      ? {
          accountFrom,
          payload,
        }
      : null,
    accountFrom && payload && aptosClient ? fetcher(aptosClient) : () => null,
    {
      refreshInterval,
    }
  );

  return useMemo(() => {
    console.log(data, error);
    if (!accountFrom && !payload) {
      return {
        pending: false,
        data: undefined,
        error: undefined,
      };
    }
    return {
      pending: isValidating,
      data,
      error,
    };
  }, [accountFrom, payload, isValidating, data, error]);
}
