import { Types } from "aptos";
import { useMemo } from "react";
import { useRecoilValue } from "recoil";

import { FT_FAUCET_ADDRESSES } from "@/constants/contracts";
import useFaucet from "@/hooks/useFaucet";
import { coinListState } from "@/recoil/coinList";
import { networkState } from "@/recoil/network";
import { ICoinInfo, Network } from "@/types/misc";

import FaucetButton from "./FaucetButton";

const FAUCET_PAYLOADS: Record<
  Partial<keyof typeof Network>,
  Record<Partial<"LBTC" | "LETH" | "LUSDT" | "LUSDC">, string> | undefined
> = {
  [Network.Devnet]: undefined,
  [Network.Testnet]: {
    LBTC: "100000000",
    LETH: "1000000000",
    LUSDT: "1000000000000",
    LUSDC: "1000000000000",
  },
  [Network.Mainnet]: undefined,
};

export default function FaucetBox() {
  const { items: coinList } = useRecoilValue(coinListState);
  const { network } = useRecoilValue(networkState);

  const coins: Record<
    Partial<"LBTC" | "LETH" | "LUSDT" | "LUSDC">,
    ICoinInfo
  > = useMemo(() => {
    return (
      (coinList || [])
        .filter((token) =>
          ["LBTC", "LETH", "LUSDT", "LUSDC"].includes(token.symbol)
        )
        // eslint-disable-next-line unicorn/no-array-reduce
        .reduceRight((prev, currItem) => {
          return {
            ...prev,
            [currItem.symbol]: currItem,
          };
        }, {} as Record<Partial<"LBTC" | "LETH" | "LUSDT" | "LUSDC">, ICoinInfo>)
    );
  }, [coinList]);

  const payloads: Record<
    "LBTC" | "LETH" | "LUSDT" | "LUSDC",
    Types.TransactionPayload_EntryFunctionPayload | undefined
  > = useMemo(() => {
    return {
      LBTC:
        coins?.LBTC &&
        FAUCET_PAYLOADS[network] &&
        FAUCET_PAYLOADS[network]?.LBTC
          ? {
              type: "entry_function_payload",
              function: `${FT_FAUCET_ADDRESSES[network]}::coin_airdrop::claim`,
              type_arguments: [coins.LBTC?.token_type.type],
              arguments: [FAUCET_PAYLOADS[network]?.LBTC],
            }
          : undefined,
      LETH:
        coins?.LETH &&
        FAUCET_PAYLOADS[network] &&
        FAUCET_PAYLOADS[network]?.LETH
          ? {
              type: "entry_function_payload",
              function: `${FT_FAUCET_ADDRESSES[network]}::coin_airdrop::claim`,
              type_arguments: [coins.LETH?.token_type.type],
              arguments: [FAUCET_PAYLOADS[network]?.LETH],
            }
          : undefined,
      LUSDT:
        coins?.LUSDT &&
        FAUCET_PAYLOADS[network] &&
        FAUCET_PAYLOADS[network]?.LUSDT
          ? {
              type: "entry_function_payload",
              function: `${FT_FAUCET_ADDRESSES[network]}::coin_airdrop::claim`,
              type_arguments: [coins.LUSDT?.token_type.type],
              arguments: [FAUCET_PAYLOADS[network]?.LUSDT],
            }
          : undefined,
      LUSDC:
        coins?.LUSDC &&
        FAUCET_PAYLOADS[network] &&
        FAUCET_PAYLOADS[network]?.LUSDC
          ? {
              type: "entry_function_payload",
              function: `${FT_FAUCET_ADDRESSES[network]}::coin_airdrop::claim`,
              type_arguments: [coins.LUSDC?.token_type.type],
              arguments: [FAUCET_PAYLOADS[network]?.LUSDC],
            }
          : undefined,
    };
  }, [coins, network]);

  return (
    <div className="mt-5 flex items-center justify-center space-x-3">
      {payloads.LBTC && (
        // <button
        //   disabled={pending}
        //   className={`inline-flex items-center rounded border border-transparent bg-indigo-100 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        //     pending ? "cursor-wait" : "cursor-pointer"
        //   }`}
        //   onClick={() => {
        //     mutate(payloads.LBTC);
        //   }}
        // >
        //   Get 1BTC
        // </button>
        <FaucetButton text="Get 1BTC" payload={payloads.LBTC} />
      )}
      {payloads.LETH && (
        <FaucetButton text="Get 10ETH" payload={payloads.LETH} />
      )}
      {payloads.LUSDT && (
        <FaucetButton text="Get 10000USDT" payload={payloads.LUSDT} />
      )}

      {payloads.LUSDC && (
        <FaucetButton text="Get 10000USDC" payload={payloads.LUSDC} />
      )}
    </div>
  );
}
