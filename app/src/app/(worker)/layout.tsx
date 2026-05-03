"use client";

import type { ReactNode } from "react";
import { Layout, Menu, Typography } from "antd";
import { usePathname, useRouter } from "next/navigation";

const { Header, Content } = Layout;

export default function JobsLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Header
        style={{
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          height: "auto",
          padding: "12px 16px 0",
        }}
      >
        <Typography.Title level={4} style={{ margin: "0 0 8px" }}>
          GCAT Worker
        </Typography.Title>
        <Menu
          mode="horizontal"
          selectedKeys={[pathname === "/income" ? "income" : "jobs"]}
          onClick={(event) => router.push(`/${event.key}`)}
          items={[
            { key: "jobs", label: "Công việc" },
            { key: "income", label: "Thu nhập" },
          ]}
          style={{ borderBottom: 0 }}
        />
      </Header>

      <Content style={{ padding: 16 }}>{children}</Content>
    </Layout>
  );
}
