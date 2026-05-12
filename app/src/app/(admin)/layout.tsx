"use client";

import { Button, Layout, Menu, Typography } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

const { Sider, Content, Header } = Layout;

export default function AdminLayout({ children }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const selectedKey = pathname.split("/").filter(Boolean)[0] ?? "products";

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="light" width={240}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: 20 }}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              GCAT Admin
            </Typography.Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={(e) => router.push(`/${e.key}`)}
            items={[
              { key: "products", label: "Sản phẩm" },
              { key: "operations", label: "Công đoạn" },
              { key: "assignments", label: "Phân công" },
              { key: "reports", label: "Báo cáo" },
              { key: "users", label: "Người dùng" },
            ]}
          />
          <div style={{ marginTop: "auto", padding: 16 }}>
            <Button danger block onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            height: 56,
            lineHeight: "56px",
            paddingInline: 24,
          }}
        >
          <Typography.Text strong>Quản lý sản xuất may mặc</Typography.Text>
        </Header>
        <Content style={{ padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
