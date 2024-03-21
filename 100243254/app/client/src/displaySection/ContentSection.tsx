import React from "react";
import { Breadcrumb, Layout, theme } from "antd";

const BreadcrumbItems = () => (
  <Breadcrumb style={{ margin: "16px 0" }}>
    <Breadcrumb.Item>Home</Breadcrumb.Item>
    <Breadcrumb.Item>Pet NFT</Breadcrumb.Item>
  </Breadcrumb>
);

export const ContentSection = ({ children }: { children: React.ReactNode }) => {
  const { Content } = Layout;
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Content style={{ padding: "0 48px" }}>
      <BreadcrumbItems />
      <div
        style={{
          padding: 24,
          minHeight: "auto",
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        {children}
      </div>
    </Content>
  );
};
