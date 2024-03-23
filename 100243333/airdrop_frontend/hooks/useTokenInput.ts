import { BigNumber, parseFixed } from "@ethersproject/bignumber";
import { useEffect, useMemo } from "react";

import { getErrMsg } from "@/lib/error";
import { ICoinInfo } from "@/types/misc";

import useCoinBalance from "./useCoinBalance";

export default function useTokenInput(
  token?: ICoinInfo,
  inputDisplayed?: string
) {
  const {
    balance,
    displayed: balanceDisplayed,
    isValidating,
    error,
  } = useCoinBalance(token?.token_type?.type, 5000);

  const isLoading = !balance && !error;

  const inputBigNumber: BigNumber | undefined = useMemo(() => {
    if (!token) return undefined;
    if (
      typeof inputDisplayed !== "undefined" &&
      inputDisplayed !== "" &&
      typeof +inputDisplayed === "number"
    ) {
      try {
        const inputBigNumber = parseFixed(inputDisplayed, token.decimals);
        return inputBigNumber;
      } catch (error) {
        console.log(error);
        return undefined;
      }
    }
    return undefined;
  }, [inputDisplayed, token]);

  const errMsg = useMemo(() => {
    const balanceErrMsg: any = errMsg ? getErrMsg(errMsg) : undefined;
    if (balanceErrMsg) return balanceErrMsg;
    if (!inputBigNumber) return undefined;
    if (!balance) return "Unknown balance";
    const balanceBigNumber = BigNumber.from(balance);
    return balanceBigNumber.lt(inputBigNumber)
      ? "Insufficient balance"
      : undefined;
  }, [balance, inputBigNumber]);

  return useMemo(() => {
    return {
      balance,
      balanceDisplayed,
      inputAmount: inputBigNumber?.toString(),
      isLoading,
      error: errMsg,
    };
  }, [balance, balanceDisplayed, errMsg, inputBigNumber, isLoading]);
}
