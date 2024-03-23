import { useWallet } from "@manahippo/aptos-wallet-adapter";
import useAptosWallet from "hooks/useAptosWallet";
import { walletAddressEllipsis } from "utils/utility";

const WalletMenu = ({ onDisconnected }: { onDisconnected: () => any }) => {
  const { disconnect } = useWallet();
  const { activeWallet } = useAptosWallet();
  return (
    <div className="flex w-full flex-col p-2">
      <div className="mobile:block mb-6 hidden space-y-2 text-center">
        <div className="h6 text-gradient-primary">Wallet connected</div>
        <div className="h5">
          {walletAddressEllipsis(activeWallet?.toString())}
        </div>
      </div>
      <button
        onClick={async () => {
          await disconnect();
          onDisconnected();
        }}
        className="w-full"
      >
        Disconnect wallet
      </button>
    </div>
  );
};

export default WalletMenu;
