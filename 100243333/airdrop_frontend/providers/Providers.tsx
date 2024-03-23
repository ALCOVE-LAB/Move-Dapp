import {
  AptosWalletAdapter,
  BitkeepWalletAdapter,
  FewchaWalletAdapter,
  MartianWalletAdapter,
  NightlyWalletAdapter,
  PontemWalletAdapter,
  RiseWalletAdapter,
  WalletProvider,
} from "@manahippo/aptos-wallet-adapter";
import { AptosWalletProvider } from "contexts/AptosWalletProvider";
import { useMemo } from "react";
import toast from "react-hot-toast";

import ErrorBoundary from "@/components/ErrorBoundary";
import { getErrMsg } from "@/lib/error";

const isDevelopmentMode = process.env.NODE_ENV === "development";

type TProps = {
  children: any;
};

const Providers: React.FC<TProps> = (props: TProps) => {
  const wallets = useMemo(
    () => [
      // new RiseWalletAdapter(),
      new MartianWalletAdapter(),
      new AptosWalletAdapter(),
      new PontemWalletAdapter(),
      // new FewchaWalletAdapter(),
      // new BitkeepWalletAdapter(),
      // new NightlyWalletAdapter()
    ],
    []
  );

  return (
    <ErrorBoundary>
      <WalletProvider
        wallets={wallets}
        autoConnect
        onError={(error: Error) => {
          let text = "Unknow error";
          if (error.name === "WalletNotReadyError") {
            text = "Wallet not ready";
            toast.error(text);
          }
          // toast.error(getErrMsg(error) || text);
        }}
      >
        <AptosWalletProvider>{props.children}</AptosWalletProvider>
      </WalletProvider>
    </ErrorBoundary>
  );
};

export default Providers;
