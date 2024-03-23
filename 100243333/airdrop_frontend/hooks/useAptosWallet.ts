import { AptosWalletContext } from "contexts/AptosWalletProvider";
import { useContext } from "react";

const useAptosWallet = () => useContext(AptosWalletContext);

export default useAptosWallet;
