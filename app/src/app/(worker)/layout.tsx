"use client";

import type { ReactNode } from "react";
import { Layout, Menu } from "antd";
import { usePathname, useRouter } from "next/navigation";

const { Header, Content } = Layout;

export default function JobsLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center">
        <Menu
          mode="horizontal"
          theme="dark"
          selectedKeys={[pathname === "/income" ? "income" : "jobs"]}
          onClick={(event) => router.push(`/${event.key}`)}
          items={[
            { key: "jobs", label: "Jobs" },
            { key: "income", label: "Income" },
          ]}
          className="flex-1"
        />
      </Header>

      <Content>{children}</Content>
    </Layout>
  );
}
