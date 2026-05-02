"use client";

import { Layout, Menu } from "antd";
import { useRouter } from "next/navigation";

const { Sider, Content } = Layout;

export default function AdminLayout({ children }: any) {
  const router = useRouter();

  return (
    <Layout>
      <Sider>
        <Menu
          onClick={(e) => router.push(`/admin/${e.key}`)}
          items={[
            { key: "products", label: "Products" },
            { key: "operations", label: "Operations" },
            { key: "assignments", label: "Assignments" },
            { key: "reports", label: "Reports" },
            { key: "users", label: "Users" },
          ]}
        />
      </Sider>

      <Content className="p-6">{children}</Content>
    </Layout>
  );
}