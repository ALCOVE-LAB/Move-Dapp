import React from "react";
import {
  NFTDisplaySection,
  ContentSection,
  FooterSection,
} from "./displaySection";
import { Navigation } from "./navigation";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

import { Layout, Alert } from "antd";

export const App = () => {
  const { connected, account } = useWallet();

  const DisplaySection = () => {
    if (!connected) {
      return <Alert message="Connect wallet to see your portfolio." />;
    }

    return account && <NFTDisplaySection address={account.address} />;
  };

  return (
    <Layout>
      <Navigation />
      <ContentSection>
        <DisplaySection />
      </ContentSection>
      <FooterSection />
    </Layout>
  );
};
