"use client";

import {
  Button,
  Card,
  Empty,
  Input,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getReports, getSalarySummary } from "@/services/report.service";
import { getUsers } from "@/services/user.service";
import type { Report, User } from "@/services/types";

const today = () => new Date().toISOString().slice(0, 10);

const firstDayOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
};

const readStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function IncomePage() {
  const [workers, setWorkers] = useState<User[]>([]);
  const [workerId, setWorkerId] = useState<number>();
  const [fromDate, setFromDate] = useState(firstDayOfMonth());
  const [toDate, setToDate] = useState(today());
  const [reports, setReports] = useState<Report[]>([]);
  const [salary, setSalary] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadWorkers = async () => {
    const res = await getUsers({ role: "worker", limit: 100 });
    setWorkers(res.data);

    const storedUser = readStoredUser();
    const defaultWorkerId =
      storedUser?.role === "worker" ? storedUser.id : res.data[0]?.id;
    setWorkerId((current) => current ?? defaultWorkerId);
  };

  const fetchData = useCallback(async (nextWorkerId = workerId) => {
    if (!nextWorkerId) return;

    setLoading(true);
    try {
      const [salaryRes, reportsRes] = await Promise.all([
        getSalarySummary({
          worker_id: nextWorkerId,
          from_date: fromDate,
          to_date: toDate,
        }),
        getReports({
          worker_id: nextWorkerId,
          from_date: fromDate,
          to_date: toDate,
          limit: 100,
        }),
      ]);

      setSalary(Number(salaryRes.total_salary ?? 0));
      setReports(reportsRes.data);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, workerId]);

  useEffect(() => {
    loadWorkers();
  }, []);

  useEffect(() => {
    if (workerId) fetchData(workerId);
  }, [fetchData, workerId]);

  const totalQuantity = reports.reduce(
    (sum, report) => sum + Number(report.quantity ?? 0),
    0,
  );

  const chartData = useMemo(() => {
    const byDate = new Map<string, number>();
    reports.forEach((report) => {
      const key = report.report_date
        ? new Date(report.report_date).toLocaleDateString("vi-VN")
        : "N/A";
      const amount = Number(report.quantity ?? 0) * Number(report.price ?? 0);
      byDate.set(key, (byDate.get(key) ?? 0) + amount);
    });
    return Array.from(byDate.entries()).map(([date, amount]) => ({
      date,
      amount,
    }));
  }, [reports]);

  const maxAmount = Math.max(...chartData.map((item) => item.amount), 1);

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card size="small">
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Thu nhập dự kiến
            </Typography.Title>
            <Typography.Text type="secondary">
              Xem lương theo công nhân và khoảng ngày.
            </Typography.Text>
          </div>

          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Chọn công nhân"
            value={workerId}
            onChange={setWorkerId}
            style={{ width: "100%" }}
            options={workers.map((worker) => ({
              value: worker.id,
              label: `${worker.name} - ${worker.phone}`,
            }))}
          />

          <Space.Compact style={{ width: "100%" }}>
            <Input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
            <Input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
            <Button type="primary" onClick={() => fetchData()}>
              Loc
            </Button>
          </Space.Compact>
        </Space>
      </Card>

      <Spin spinning={loading}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 12,
            }}
          >
            <Card size="small">
              <Statistic
                title="Tổng lương"
                value={salary}
                formatter={(value) =>
                  `${Number(value).toLocaleString("vi-VN")} d`
                }
              />
            </Card>
            <Card size="small">
              <Statistic title="Sản lượng" value={totalQuantity} />
            </Card>
            <Card size="small">
              <Statistic title="Báo cáo" value={reports.length} />
            </Card>
          </div>

          <Card size="small" title="Theo ngay">
            {chartData.length === 0 ? (
              <Empty description="Chưa có dữ liệu" />
            ) : (
              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                {chartData.map((item) => (
                  <div key={item.date}>
                    <Space
                      style={{ justifyContent: "space-between", width: "100%" }}
                    >
                      <Typography.Text>{item.date}</Typography.Text>
                      <Typography.Text strong>
                        {item.amount.toLocaleString("vi-VN")} d
                      </Typography.Text>
                    </Space>
                    <div
                      style={{
                        height: 10,
                        background: "#f0f0f0",
                        borderRadius: 999,
                        overflow: "hidden",
                        marginTop: 4,
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(
                            (item.amount / maxAmount) * 100,
                            4,
                          )}%`,
                          height: "100%",
                          background: "#1677ff",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </Space>
            )}
          </Card>

          <Card size="small" title="Lịch sử báo cáo">
            <Table
              size="small"
              dataSource={reports}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              scroll={{ x: 720 }}
              columns={[
                {
                  title: "Ngày",
                  dataIndex: "report_date",
                  render: (value?: string) =>
                    value ? new Date(value).toLocaleDateString("vi-VN") : "",
                },
                { title: "Công đoạn", dataIndex: "operation_name" },
                { title: "Mã SP", dataIndex: "product_code" },
                { title: "SL", dataIndex: "quantity" },
                {
                  title: "Tiền",
                  render: (_, record) =>
                    (
                      Number(record.price ?? 0) * Number(record.quantity ?? 0)
                    ).toLocaleString("vi-VN"),
                },
                {
                  title: "TT",
                  dataIndex: "status",
                  render: (status?: string) => (
                    <Tag color={status === "approved" ? "green" : "gold"}>
                      {status ?? "pending"}
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>
        </Space>
      </Spin>
    </Space>
  );
}
