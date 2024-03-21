import { aptos } from "../utils";

const getUserAptBalance = async (address: string): Promise<number> => {
  const APT_COIN = "0x1::aptos_coin::AptosCoin";

  const result = await aptos.getAccountCoinAmount({
    accountAddress: address,
    coinType: APT_COIN,
  });

  return result;
};
