import {
  useWallet,
  WalletReadyState,
  Wallet,
  WalletName,
} from "@aptos-labs/wallet-adapter-react";
import { Button } from "antd";

export const WalletButtons = () => {
  const { wallets, connected, disconnect, isLoading, account } = useWallet();

  if (connected) {
    const address =
      account?.address.slice(0, 6) + "..." + account?.address.slice(-4);
    return <Button onClick={disconnect}>Disconnect: {address} </Button>;
  }

  if (isLoading || !wallets[0]) {
    return (
      <Button type="default" loading>
        Wallet Connecting...
      </Button>
    );
  }

  return <WalletView wallet={wallets[0]} />;
};

const WalletView = ({ wallet }: { wallet: Wallet }) => {
  const { connect } = useWallet();

  const isWalletReady =
    wallet.readyState === WalletReadyState.Installed ||
    wallet.readyState === WalletReadyState.Loadable;

  const onWalletConnectRequest = async (walletName: WalletName) => {
    try {
      connect(walletName);
    } catch (error) {
      window.alert("Failed to connect wallet");
    }
  };

  const onWalletConnect = () => onWalletConnectRequest(wallet.name);

  return (
    <Button disabled={!isWalletReady} onClick={onWalletConnect}>
      Connect Wallet
    </Button>
  );
};
