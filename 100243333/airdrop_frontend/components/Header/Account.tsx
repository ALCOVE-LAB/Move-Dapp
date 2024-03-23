import { useWallet } from "@manahippo/aptos-wallet-adapter";
import { walletAddressEllipsis } from "utils/utility";

import useAptosWallet from "@/hooks/useAptosWallet";

export default function Account() {
  const { activeWallet, connected, openModal, closeModal } = useAptosWallet();
  const { disconnect } = useWallet();
  if (connected) {
    return (
      <button
        type="button"
        className="inline-flex h-10 w-auto items-center justify-center rounded-lg border-2 border-primary/20 px-3 py-1 text-primary transition-colors hover:border-primary"
        onClick={disconnect}
      >
        {walletAddressEllipsis(activeWallet?.toString())}
      </button>
    );
  }
  return (
    <button
      type="button"
      className="rounded-lg bg-primary px-3 py-2 leading-6 text-white hover:bg-primary-lighter"
      onClick={openModal}
    >
      Connect
    </button>
  );
}
