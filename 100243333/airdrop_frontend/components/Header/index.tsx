import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { useWindowScroll } from "react-use";
import { useRecoilState, useRecoilValue } from "recoil";

import useAptosWallet from "@/hooks/useAptosWallet";
import { cartState } from "@/recoil/cart";
import { networkState } from "@/recoil/network";

import Account from "./Account";
import SearchBox from "./SearchBox";

export default function Header() {
  const { network } = useRecoilValue(networkState);
  const [cartData, setCartData] = useRecoilState(cartState);
  const { y } = useWindowScroll();
  const { connected } = useAptosWallet();
  const handleOpenCart = useCallback(() => {
    setCartData((prevState) => {
      return {
        ...prevState,
        isOpen: true,
      };
    });
  }, [setCartData]);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-20 flex h-20 items-center justify-between px-8 py-0 ${
        y && y > 1 ? "bg-white shadow" : "bg-transparent"
      }`}
    >
      <div className="inline-flex items-center justify-start space-x-3">
        <Account />
      </div>
    </header>
  );
}
