import { BigNumber } from "@ethersproject/bignumber";

import { ITokenPair } from "./aptos";
import { ICoinInfo } from "./misc";

export type SwapExecutionPrice = BigNumber;

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT,
}

export enum TradeState {
  UNKNOWN,
  LOADING,
  INVALID,
  NO_ROUTE_FOUND,
  VALID,
  SYNCING,
}

export interface TradeDetail {
  inputToken: ICoinInfo;
  outputToken: ICoinInfo;
  routes: ITokenPair[];
  inputAmount: string;
  outputAmount: string;
  executionPrice?: SwapExecutionPrice;
}

export interface Trade {
  state: TradeState;
  trade?: TradeDetail;
  error?: unknown;
}

export enum SWAP_ERROR {
  ERROR_ONLY_ADMIN = 0,
  ERROR_ALREADY_INITIALIZED = 1,
  ERROR_NOT_CREATOR = 2,
  ERROR_ALREADY_LOCKED = 3,
  ERROR_INSUFFICIENT_LIQUIDITY_MINTED = 4,
  ERROR_OVERFLOW = 5,
  ERROR_INSUFFICIENT_AMOUNT = 6,
  ERROR_INSUFFICIENT_LIQUIDITY = 7,
  ERROR_INVALID_AMOUNT = 8,
  ERROR_TOKENS_NOT_SORTED = 9,
  ERROR_INSUFFICIENT_LIQUIDITY_BURNED = 10,
  ERROR_INSUFFICIENT_TOKEN0_AMOUNT = 11,
  ERROR_INSUFFICIENT_TOKEN1_AMOUNT = 12,
  ERROR_INSUFFICIENT_OUTPUT_AMOUNT = 13,
  ERROR_INSUFFICIENT_INPUT_AMOUNT = 14,
  ERROR_K = 15,
  ERROR_TOKEN_NOT_REGISTERED = 16,
}
