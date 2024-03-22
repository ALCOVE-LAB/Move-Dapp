import React from "react";

import { Layout } from "antd";

const { Footer } = Layout;

export const FooterSection = () => {
  return (
    <Footer style={{ textAlign: "center" }}>
      ©{new Date().getFullYear()} Created by y-L
    </Footer>
  );
};
