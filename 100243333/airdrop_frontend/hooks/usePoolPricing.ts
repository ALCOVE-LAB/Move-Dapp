import { BigNumber, parseFixed } from "@ethersproject/bignumber";

import { BASIC_DECIMALS, ZERO } from "@/constants/misc";
import { BondingCurve, PoolType } from "@/types/nft";

export const usePoolPricing = ({
  poolType,
  spotPrice,
  bondingCurve,
  delta,
  count,
}: {
  poolType?: PoolType;
  spotPrice?: BigNumber;
  bondingCurve?: BondingCurve;
  delta?: BigNumber;
  count: number;
}) => {
  let res = ZERO;
  const basicPrice = parseFixed("1", BASIC_DECIMALS);
  if (!spotPrice || spotPrice.eq(ZERO)) return ZERO;
  if (bondingCurve === BondingCurve.Exponential) {
    delta = !delta ? ZERO : delta.div(100);
    console.log("--- delta", delta);
    // delta = !delta ? ZERO : delta.lt(basicPrice) ? delta.sub(basicPrice) : ZERO  // 取小数部分的BN类型
    if (poolType === PoolType.NFT) {
      // 卖 NFT, 递增
      let currentPrice = spotPrice;
      for (let index = 1; index <= count; index++) {
        res = res.add(currentPrice);
        currentPrice = currentPrice.mul(basicPrice.add(delta)).div(basicPrice);
      }
    } else {
      // 买 NFT, 递减
      let currentPrice = spotPrice;
      for (let index = 1; index <= count; index++) {
        res = res.add(currentPrice);
        currentPrice = currentPrice.mul(basicPrice.sub(delta)).div(basicPrice);
      }
    }
  } else {
    for (let index = 1; index <= count; index++) {
      res =
        poolType === PoolType.NFT
          ? res.add(
              spotPrice.add((delta || ZERO).mul(BigNumber.from(index - 1)))
            )
          : res.add(
              spotPrice.sub((delta || ZERO).mul(BigNumber.from(index - 1)))
            );
    }
  }
  return res;
};
