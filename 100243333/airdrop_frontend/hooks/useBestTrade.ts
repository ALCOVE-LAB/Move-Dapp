import { BigNumber } from "@ethersproject/bignumber";
import { useMemo } from "react";
import { getInputAmountByOutput, getOutputAmount } from "utils/trade";

import { SWAP_FEE, SWAP_FEE_BASE } from "@/constants/misc";
import { ITokenPair } from "@/types/aptos";
import { ICoinInfo } from "@/types/misc";

import useAllPairs from "./useAllPairs";

function getBestTrade(
  currentRoutes: ITokenPair[],
  inputAmount: string,
  inputToken: ICoinInfo,
  currentInputAmount: string,
  targetOutputToken: ICoinInfo,
  restTokenPairs: ITokenPair[],
  maxHops: number
):
  | {
      routes: ITokenPair[];
      inputAmount: string;
      outputAmount: string;
    }
  | undefined {
  if (currentRoutes?.length > 3 || maxHops === 0) return;

  // console.log(
  //   currentRoutes,
  //   inputToken?.token_type?.type,
  //   targetOutputToken.token_type.type,
  //   inputToken?.token_type?.type === targetOutputToken.token_type.type,
  //   currentInputAmount,
  //   maxHops
  // );
  if (
    inputToken?.token_type?.type &&
    inputToken?.token_type?.type === targetOutputToken.token_type.type
  ) {
    // 当前 pair 就是
    return {
      routes: currentRoutes,
      inputAmount,
      outputAmount: currentInputAmount,
    };
  }
  let bestOutput:
    | {
        routes: ITokenPair[];
        inputAmount: string;
        outputAmount: string;
      }
    | undefined;
  for (let index = 0; index < restTokenPairs.length; index++) {
    const currentPair = restTokenPairs[index];
    if (currentPair.xCoin?.token_type.type === inputToken.token_type.type) {
      // 当前 pair 是以 inputToken 开头
      const nextInputAmount = getOutputAmount(currentPair, currentInputAmount);
      if (nextInputAmount) {
        const nextCurrentRoutes = [...(currentRoutes || []), currentPair];
        const nextInputToken = currentPair.yCoin!;
        const nextRestTokenPairs = [
          ...restTokenPairs.slice(0, index),
          ...restTokenPairs.slice(index + 1, restTokenPairs.length),
        ];
        const _bestOutput = getBestTrade(
          nextCurrentRoutes,
          inputAmount,
          nextInputToken,
          nextInputAmount,
          targetOutputToken,
          nextRestTokenPairs,
          maxHops - 1
        );
        if (
          !bestOutput ||
          (_bestOutput?.outputAmount &&
            BigNumber.from(bestOutput.outputAmount).lt(
              BigNumber.from(_bestOutput?.outputAmount)
            ))
        ) {
          bestOutput = _bestOutput;
        }
      }
    }
  }
  return bestOutput;
}

function getBestTradeByOutput(
  currentRoutes: ITokenPair[],
  outputAmount: string,
  currentOutputToken: ICoinInfo,
  currentOutputAmount: string,
  targetInputToken: ICoinInfo,
  restTokenPairs: ITokenPair[],
  maxHops: number
):
  | {
      routes: ITokenPair[];
      inputAmount: string;
      outputAmount: string;
    }
  | undefined {
  if (currentRoutes?.length > 3 || maxHops === 0) return;

  if (
    currentOutputToken?.token_type?.type &&
    currentOutputToken?.token_type?.type === targetInputToken.token_type.type
  ) {
    // 当前 pair 就是
    return {
      routes: currentRoutes,
      inputAmount: currentOutputAmount,
      outputAmount,
    };
  }
  let bestOutput:
    | {
        routes: ITokenPair[];
        inputAmount: string;
        outputAmount: string;
      }
    | undefined;
  for (let index = 0; index < restTokenPairs.length; index++) {
    const currentPair = restTokenPairs[index];
    if (
      currentPair.yCoin?.token_type.type === currentOutputToken.token_type.type
    ) {
      // 当前 pair 是以 inputToken 开头
      const nextOutputAmount = getInputAmountByOutput(
        currentPair,
        currentOutputAmount
      );
      if (nextOutputAmount) {
        const nextCurrentRoutes = [currentPair, ...(currentRoutes || [])];
        const nextOutputToken = currentPair.xCoin!;
        const nextRestTokenPairs = [
          ...restTokenPairs.slice(0, index),
          ...restTokenPairs.slice(index + 1, restTokenPairs.length),
        ];
        const _bestOutput = getBestTradeByOutput(
          nextCurrentRoutes,
          outputAmount,
          nextOutputToken,
          nextOutputAmount,
          targetInputToken,
          nextRestTokenPairs,
          maxHops - 1
        );
        if (
          !bestOutput ||
          (_bestOutput?.inputAmount &&
            BigNumber.from(bestOutput.inputAmount).gt(
              BigNumber.from(_bestOutput?.inputAmount)
            ))
        ) {
          bestOutput = _bestOutput;
        }
      }
    }
  }
  return bestOutput;
}

function useAllRoutes(
  inputToken?: ICoinInfo,
  outputToken?: ICoinInfo,
  inputAmount?: string
) {
  const allPairs = useAllPairs();

  return useMemo(() => {
    if (!inputToken || !outputToken) return [];
    if (!inputAmount || !+inputAmount) return [];
    if (!allPairs || allPairs?.length === 0) return [];

    const oneStepRoutes: ITokenPair[] = [];
    const twoStepRoutes: ITokenPair[] = [];
    const threeStepRoutes: ITokenPair[] = [];

    const pairsBeginWithInputToken: ITokenPair[] = [];
    const pairsEndWithOutToken: ITokenPair[] = [];
    const pairsRest: ITokenPair[] = [];

    for (const pair of allPairs) {
      if (pair.xCoin?.token_type.type === inputToken.token_type.type) {
        pairsBeginWithInputToken.push(pair);
        if (pair.yCoin?.token_type.type === outputToken.token_type.type) {
          oneStepRoutes.push(pair); // 找到了一步 swap 路由
        }
      } else if (pair.yCoin?.token_type.type === outputToken.token_type.type) {
        pairsEndWithOutToken.push(pair);
      } else {
        pairsRest.push(pair);
      }
    }
  }, [allPairs, inputAmount, inputToken, outputToken]);
}

const getInputAmountWithFee = (inputAmount: string | undefined) => {
  return (
    BigNumber.from(inputAmount)
      // .mul(BigNumber.from(`${SWAP_FEE_BASE - SWAP_FEE}`))
      // .div(BigNumber.from(SWAP_FEE_BASE))
      .toString()
  );
};

export default function useBestTrade(
  inputToken: ICoinInfo | undefined,
  outputToken: ICoinInfo | undefined,
  inputAmount: string | undefined,
  outputAmount: string | undefined,
  isExactIn: boolean,
  slippage?: number
):
  | {
      routes: ITokenPair[];
      inputAmount: string;
      outputAmount: string;
    }
  | undefined {
  const allPairs = useAllPairs();
  const bestTrade = isExactIn
    ? inputToken && inputAmount && outputToken && allPairs
      ? getBestTrade(
          [],
          inputAmount,
          inputToken,
          inputAmount,
          outputToken,
          allPairs,
          3
        )
      : undefined
    : inputToken && outputAmount && outputToken && allPairs
    ? getBestTradeByOutput(
        [],
        outputAmount,
        outputToken,
        outputAmount,
        inputToken,
        allPairs,
        3
      )
    : undefined;
  return bestTrade;
}
