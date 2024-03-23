import { useWallet } from "@manahippo/aptos-wallet-adapter";
import useAptosWallet from "hooks/useAptosWallet";
import { walletAddressEllipsis } from "utils/utility";

import Modal from "../Modal";
import WalletMenu from "./components/WalletMenu";
import WalletSelector from "./components/WalletSelector";

const WalletModal = ({ className = "" }: { className?: string }) => {
  const { activeWallet, closeModal } = useAptosWallet();

  return (
    <div className={className}>
      {activeWallet ? (
        <WalletMenu
          onDisconnected={() => {
            closeModal();
          }}
        />
      ) : (
        <WalletSelector
          onConnected={() => {
            closeModal();
          }}
        />
      )}
    </div>
  );
};

const WalletConnector: React.FC = () => {
  const { open, closeModal } = useAptosWallet();

  return (
    <>
      <Modal
        title="Connect to wallet"
        isOpen={open}
        onDismiss={closeModal}
        maxWidth={"400px"}
      >
        <WalletModal />
      </Modal>
    </>
  );
};

export default WalletConnector;
