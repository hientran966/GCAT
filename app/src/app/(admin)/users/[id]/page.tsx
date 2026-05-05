"use client";

import {
  Button,
  Card,
  Descriptions,
  Empty,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAssignments } from "@/services/assignment.service";
import { getReports } from "@/services/report.service";
import { getUser } from "@/services/user.service";
import type { Assignment, Report, Role, User } from "@/services/types";

const roleColor: Record<Role, string> = {
  admin: "red",
  manager: "blue",
  worker: "green",
};

const statusColor: Record<string, string> = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params.id;
  const [user, setUser] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, assignmentsRes, reportsRes] = await Promise.all([
          getUser(userId),
          getAssignments({ worker_id: userId, limit: 100 }),
          getReports({ worker_id: userId, limit: 100 }),
        ]);

        setUser(userRes);
        setAssignments(assignmentsRes.data);
        setReports(reportsRes.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const totalQuantity = useMemo(
    () => reports.reduce((sum, report) => sum + Number(report.quantity ?? 0), 0),
    [reports],
  );

  const totalAmount = useMemo(
    () =>
      reports.reduce(
        (sum, report) =>
          sum + Number(report.quantity ?? 0) * Number(report.price ?? 0),
        0,
      ),
    [reports],
  );

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Space style={{ justifyContent: "space-between", width: "100%" }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Chi tiết người dùng
          </Typography.Title>
          <Typography.Text type="secondary">
            Thông tin, phân công và lịch sử báo cáo của công nhân.
          </Typography.Text>
        </div>
        <Button onClick={() => router.push("/users")}>Quay lại</Button>
      </Space>

      <Spin spinning={loading}>
        {!user ? (
          <Card>
            <Empty description="Không tìm thấy người dùng" />
          </Card>
        ) : (
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Card size="small" title="Thông tin">
              <Descriptions
                column={{ xs: 1, sm: 2, md: 3 }}
                items={[
                  { key: "name", label: "Tên", children: user.name },
                  {
                    key: "phone",
                    label: "Số điện thoại",
                    children: user.phone,
                  },
                  {
                    key: "role",
                    label: "Vai trò",
                    children: (
                      <Tag color={roleColor[user.role]}>{user.role}</Tag>
                    ),
                  },
                  {
                    key: "created_at",
                    label: "Ngày tạo",
                    children: user.created_at
                      ? new Date(user.created_at).toLocaleString("vi-VN")
                      : "",
                  },
                ]}
              />
            </Card>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              <Card size="small">
                <Statistic title="Công đoạn được giao" value={assignments.length} />
              </Card>
              <Card size="small">
                <Statistic title="Tổng sản lượng" value={totalQuantity} />
              </Card>
              <Card size="small">
                <Statistic
                  title="Tổng tiền báo cáo"
                  value={totalAmount}
                  formatter={(value) =>
                    `${Number(value).toLocaleString("vi-VN")} đ`
                  }
                />
              </Card>
            </div>

            <Card size="small" title="Công đoạn được giao">
              <Table
                size="small"
                dataSource={assignments}
                rowKey="id"
                pagination={{ pageSize: 8 }}
                scroll={{ x: 720 }}
                columns={[
                  { title: "Công đoạn", dataIndex: "operation_name" },
                  { title: "Mã sản phẩm", dataIndex: "product_code" },
                  { title: "Sản phẩm", dataIndex: "product_name" },
                  {
                    title: "Đơn giá",
                    dataIndex: "price",
                    render: (price) =>
                      Number(price ?? 0).toLocaleString("vi-VN"),
                  },
                  {
                    title: "Ngày giao",
                    dataIndex: "created_at",
                    render: (value?: string) =>
                      value ? new Date(value).toLocaleDateString("vi-VN") : "",
                  },
                ]}
              />
            </Card>

            <Card size="small" title="Lịch sử báo cáo">
              <Table
                size="small"
                dataSource={reports}
                rowKey="id"
                pagination={{ pageSize: 8 }}
                scroll={{ x: 920 }}
                columns={[
                  {
                    title: "Ngày",
                    dataIndex: "report_date",
                    render: (value?: string) =>
                      value ? new Date(value).toLocaleDateString("vi-VN") : "",
                  },
                  { title: "Công đoạn", dataIndex: "operation_name" },
                  { title: "Mã sản phẩm", dataIndex: "product_code" },
                  { title: "Số lượng", dataIndex: "quantity" },
                  {
                    title: "Đơn giá",
                    dataIndex: "price",
                    render: (price) =>
                      Number(price ?? 0).toLocaleString("vi-VN"),
                  },
                  {
                    title: "Thành tiền",
                    render: (_, record) =>
                      (
                        Number(record.price ?? 0) *
                        Number(record.quantity ?? 0)
                      ).toLocaleString("vi-VN"),
                  },
                  {
                    title: "Trạng thái",
                    dataIndex: "status",
                    render: (status?: string) =>
                      status ? (
                        <Tag color={statusColor[status] ?? "default"}>
                          {status}
                        </Tag>
                      ) : null,
                  },
                ]}
              />
            </Card>
          </Space>
        )}
      </Spin>
    </Space>
  );
}
