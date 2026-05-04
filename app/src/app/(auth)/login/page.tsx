"use client";

import { useState } from "react";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import styles from "./login.module.css";

type LoginFormValues = {
  phone: string;
  password: string;
};

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setAuth = useAuthStore((s: any) => s.setAuth);
  const router = useRouter();

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    setError("");

    try {
      const res = await login(values);
      setAuth(res);

      router.push("/jobs");
    } catch {
      setError("Số điện thoại hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.brand}>
          <Typography.Text className={styles.kicker}>GCAT</Typography.Text>
          <Typography.Title level={1} className={styles.title}>
            Đăng nhập hệ thống
          </Typography.Title>
          <Typography.Paragraph className={styles.subtitle}>
            Quản lý sản xuất, phân công và báo cáo công việc trong một nơi.
          </Typography.Paragraph>
        </div>

        <Card className={styles.card} variant="borderless">
          <Form<LoginFormValues>
            layout="vertical"
            requiredMark={false}
            onFinish={handleLogin}
            className={styles.form}
          >
            <div>
              <Typography.Title level={3} className={styles.formTitle}>
                Chào mừng trở lại
              </Typography.Title>
              <Typography.Text type="secondary">
                Nhập thông tin tài khoản để tiếp tục.
              </Typography.Text>
            </div>

            {error && <Alert type="error" showIcon message={error} />}

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
              ]}
            >
              <Input
                size="large"
                placeholder="Nhập số điện thoại"
                autoComplete="tel"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password
                size="large"
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Đăng nhập
            </Button>
          </Form>
        </Card>
      </section>
    </div>
  );
}
