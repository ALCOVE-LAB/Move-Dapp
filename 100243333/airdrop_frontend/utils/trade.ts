import { BigNumber } from "@ethersproject/bignumber";

import { SWAP_FEE, SWAP_FEE_BASE, ZERO } from "@/constants/misc";
import { ITokenPair } from "@/types/aptos";
import { BondingCurve } from "@/types/nft";

const calculateOutputAmount = (
  balanceX: string,
  balanceY: string,
  lastK: string,
  deltaX: string
) => {
  // lastK = balanceX * balanceY = (balanceX + deltaX) * (balanceY - deltaY)
  // deltaY = balanceY - lastK / (balanceX + deltaX)

  // return BigNumber.from(balanceY).sub(
  //   BigNumber.from(lastK).div(
  //     BigNumber.from(balanceX).add(BigNumber.from(deltaX))
  //   )
  // );
  const amountInWithFee = BigNumber.from(deltaX).mul(
    BigNumber.from(`${SWAP_FEE_BASE - SWAP_FEE}`)
  );
  const numerator = amountInWithFee.mul(BigNumber.from(balanceY));
  const denominator = BigNumber.from(balanceX)
    .mul(BigNumber.from(SWAP_FEE_BASE))
    .add(amountInWithFee);
  return numerator.div(denominator);
};

const calculateInputAmount = (
  balanceX: string,
  balanceY: string,
  lastK: string,
  deltaY: string
) => {
  // lastK = balanceX * balanceY = (balanceX + deltaX) * (balanceY - deltaY)
  // deltaY = balanceY - lastK / (balanceX + deltaX)
  // return BigNumber.from(balanceY).sub(
  //   BigNumber.from(lastK).div(
  //     BigNumber.from(balanceX).add(BigNumber.from(deltaX))
  //   )
  // );

  const numerator = BigNumber.from(deltaY)
    .mul(BigNumber.from(SWAP_FEE_BASE))
    .mul(BigNumber.from(balanceX));
  const denominator = BigNumber.from(balanceY)
    .sub(BigNumber.from(deltaY))
    .mul(BigNumber.from(SWAP_FEE_BASE - SWAP_FEE));
  return numerator.div(denominator);

  // return BigNumber.from(balanceX)
  //   .mul(BigNumber.from(balanceY))
  //   .div(BigNumber.from(balanceY).sub(BigNumber.from(deltaY)))
  //   .mul(BigNumber.from(SWAP_FEE_BASE))
  //   .div(BigNumber.from(SWAP_FEE_BASE - SWAP_FEE))
  //   .sub(
  //     BigNumber.from(balanceX)
  //       .mul(BigNumber.from(SWAP_FEE_BASE))
  //       .div(BigNumber.from(SWAP_FEE_BASE - SWAP_FEE))
  //   );
};

export const getOutputAmount = (tokenPair: ITokenPair, inputAmount: string) => {
  if (!tokenPair) return;
  if (!+inputAmount || BigNumber.from(inputAmount).lte(ZERO)) return;
  const lastK = tokenPair.tokenPairMetadata?.data.k_last;
  const balanceX = tokenPair.tokenPairMetadata?.data.balance_x.value;
  const balanceY = tokenPair.tokenPairMetadata?.data.balance_y.value;
  if (!lastK || !balanceY || !balanceX) return;
  const expectedOutputAmount: BigNumber = calculateOutputAmount(
    balanceX,
    balanceY,
    lastK,
    inputAmount
  );
  if (expectedOutputAmount.gt(BigNumber.from(balanceY))) {
    console.log("流动性不足");
    return;
  }
  return expectedOutputAmount.toString();
};

export const getInputAmountByOutput = (
  tokenPair: ITokenPair,
  outputAmount: string
) => {
  if (!tokenPair) return;
  if (!+outputAmount || BigNumber.from(outputAmount).lte(ZERO)) return;
  const lastK = tokenPair.tokenPairMetadata?.data.k_last;
  const balanceX = tokenPair.tokenPairMetadata?.data.balance_x.value;
  const balanceY = tokenPair.tokenPairMetadata?.data.balance_y.value;
  if (!lastK || !balanceY || !balanceX) return;
  const expectedInputAmount: BigNumber = calculateInputAmount(
    balanceX,
    balanceY,
    lastK,
    outputAmount
  );
  if (expectedInputAmount.gt(BigNumber.from(balanceY))) {
    console.log("流动性不足");
    return;
  }
  return expectedInputAmount.toString();
};
