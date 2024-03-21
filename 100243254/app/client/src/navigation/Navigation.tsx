import { Layout } from "antd";
import { WalletButtons } from "../wallet";

const { Header } = Layout;

export const Navigation = () => (
  <Header
    style={{
      position: "sticky",
      top: 0,
      zIndex: 1,
      width: "100%",
      display: "flex",
      alignItems: "center",
    }}
  >
    <WalletButtons />
  </Header>
);
