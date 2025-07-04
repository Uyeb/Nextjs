// src/components/Layout.tsx
import React from "react";
import { Layout as AntLayout, Menu, theme, message } from "antd";
import { useRouter } from "next/router";
import { LogoutOutlined } from "@ant-design/icons";
import { deleteCookie } from "cookies-next";

const { Header, Content, Footer } = AntLayout;

const items = [
  { key: "1", label: "Contact us" },
  { key: "2", label: "Management" },
  { key: "3", label: "Setting" },
  { key: "4", label: "Language" },
  { key: "5", label: <LogoutOutlined /> },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "5") {
      deleteCookie("accessToken");
      message.success("Đăng xuất thành công!");
      router.push("/sign-in");
    }
  };

  return (
    <AntLayout style={{ height: "100vh" }}>
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
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          items={items}
          style={{ flex: 1, minWidth: 0 }}
          onClick={handleMenuClick}
        />
      </Header>
      <Content style={{ padding: "16px 24px", flex: 1 }}>
        <div
          style={{
            background: colorBgContainer,
            height: "100%",
            padding: 16,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </div>
      </Content>
      <Footer style={{ background: colorBgContainer, textAlign: "center" }}>
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </AntLayout>
  );
};

export default Layout;
