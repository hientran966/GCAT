"use client";

import type { ReactNode } from "react";
import { Button, Input, Layout, Menu } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ReportBookButton from "@/components/worker/report-book";
import { useAuthStore } from "@/store/auth.store";
import styles from "./worker-layout.module.css";

const { Header, Content } = Layout;

export default function JobsLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const logout = useAuthStore((state) => state.logout);

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.brand}>GCAT Worker</div>
        <Menu
          className={styles.nav}
          mode="horizontal"
          selectedKeys={[pathname === "/income" ? "income" : "jobs"]}
          onClick={(event) => router.push(`/${event.key}`)}
          items={[
            { key: "jobs", label: "Công việc" },
            { key: "income", label: "Thu nhập" },
          ]}
          style={{ borderBottom: 0 }}
        />
        <Input.Search
          className={styles.search}
          defaultValue={searchParams.get("q") ?? ""}
          allowClear
          placeholder="Tìm công đoạn"
          onSearch={handleSearch}
        />
        <div className={styles.book}>
          <ReportBookButton />
          <Button danger onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>
      </Header>

      <Content className={styles.content}>{children}</Content>
    </Layout>
  );
}
