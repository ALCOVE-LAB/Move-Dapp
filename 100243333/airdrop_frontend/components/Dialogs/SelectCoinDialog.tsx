import Image from "next/image";
import { useMemo, useState } from "react";
import { useRecoilValue } from "recoil";

import { coinListState } from "@/recoil/coinList";
import { ICoinInfo } from "@/types/misc";

import SearchBox from "../Header/SearchBox";
import Modal from "../Modal";

interface Props {
  isOpen: boolean;
  onDismiss: () => void;
  onSelect: (token: ICoinInfo) => void;
}

const SelectCoinDialog = ({ isOpen, onDismiss, onSelect }: Props) => {
  const { items: coinList } = useRecoilValue(coinListState);
  const [q, setQ] = useState("");

  const filteredCoinList = useMemo(() => {
    if (!q) return coinList || [];
    return (coinList || []).filter(
      (coin) =>
        coin.name.toLowerCase().includes(q.toLowerCase()) ||
        coin.official_symbol?.toLowerCase().includes(q.toLowerCase())
    );
  }, [coinList, q]);

  const isEmpty = useMemo(() => {
    return filteredCoinList.length === 0;
  }, [filteredCoinList.length]);

  return (
    <Modal
      title="Select Token"
      isOpen={isOpen}
      onDismiss={onDismiss}
      maxWidth="480px"
    >
      <div className="pt-5">
        <SearchBox
          className="mb-5 w-full"
          value={q}
          onChange={(val) => setQ(val || "")}
        />

        <div className="h-96 w-full space-y-2 overflow-auto">
          {isEmpty ? (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-sm">Empty results</span>
            </div>
          ) : (
            <>
              {filteredCoinList.map((token) => {
                return (
                  <button
                    key={token.name}
                    type="button"
                    className="flex w-full items-center justify-start rounded-lg bg-transparent transition-colors hover:bg-slate-100"
                    onClick={() => onSelect(token)}
                  >
                    <div className="relative mr-3 h-[60px] w-[60px] shrink-0">
                      {token.logo_url ? (
                        // <Image
                        //   className="absolute inset-0"
                        //   src={token.logo_url}
                        //   layout="fill"
                        //   alt={token.symbol}
                        // />
                        <div
                          className="absolute inset-2 rounded-full bg-slate-200 bg-cover bg-center bg-no-repeat"
                          style={{ backgroundImage: `url(${token.logo_url})` }}
                        ></div>
                      ) : (
                        <div className="absolute inset-2 rounded-full bg-slate-200 bg-cover bg-center bg-no-repeat"></div>
                      )}
                    </div>

                    <div className="flex flex-col items-start justify-center">
                      <span className="font-Inter text-lg font-semibold text-text-default">
                        {token.symbol}
                      </span>
                      <span className="text-sm text-text-default/30">
                        {token.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SelectCoinDialog;
