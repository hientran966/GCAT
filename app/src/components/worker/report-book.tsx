"use client";

import {
  Badge,
  Button,
  Empty,
  Input,
  InputNumber,
  Modal,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createReports } from "@/services/report.service";
import type { Assignment } from "@/services/types";

export type ReportBookItem = {
  id: string;
  assignment_id: number;
  quantity: number;
  report_date: string;
  operation_name?: string;
  product_code?: string;
  product_name?: string;
  price?: number | string;
  created_at: string;
};

const bookChangedEvent = "gcat-report-book-changed";

const localDate = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const readStoredUserId = () => {
  if (typeof window === "undefined") return "guest";
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.id ? String(user.id) : "guest";
  } catch {
    return "guest";
  }
};

const storageKey = (date: string) =>
  `gcat-report-book:v1:${readStoredUserId()}:${date}`;

export const readReportBook = (date = localDate()): ReportBookItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const value = localStorage.getItem(storageKey(date));
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
};

const writeReportBook = (date: string, items: ReportBookItem[]) => {
  localStorage.setItem(storageKey(date), JSON.stringify(items));
  window.dispatchEvent(new Event(bookChangedEvent));
};

export const addReportBookItem = (
  assignment: Assignment,
  quantity: number,
  reportDate = localDate(),
) => {
  const items = readReportBook(reportDate);
  const existing = items.find(
    (item) => item.assignment_id === assignment.id && item.report_date === reportDate,
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      id: `${Date.now()}-${assignment.id}`,
      assignment_id: assignment.id,
      quantity,
      report_date: reportDate,
      operation_name: assignment.operation_name,
      product_code: assignment.product_code,
      product_name: assignment.product_name,
      price: assignment.price,
      created_at: new Date().toISOString(),
    });
  }

  writeReportBook(reportDate, items);
};

export default function ReportBookButton() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(localDate());
  const [items, setItems] = useState<ReportBookItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const reload = useCallback(() => setItems(readReportBook(date)), [date]);

  useEffect(() => {
    reload();
    const handleChange = () => reload();
    window.addEventListener(bookChangedEvent, handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener(bookChangedEvent, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, [reload]);

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0),
    [items],
  );

  const updateQuantity = (id: string, quantity: number | null) => {
    const next = items.map((item) =>
      item.id === id ? { ...item, quantity: Number(quantity ?? 1) } : item,
    );
    setItems(next);
    writeReportBook(date, next);
  };

  const removeItem = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    writeReportBook(date, next);
  };

  const handleSubmit = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      await createReports(
        items.map((item) => ({
          assignment_id: item.assignment_id,
          quantity: item.quantity,
          report_date: item.report_date,
        })),
      );
      writeReportBook(date, []);
      setItems([]);
      message.success("Đã chốt sổ báo cáo");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Badge count={items.length} size="small">
        <Button type="primary" onClick={() => setOpen(true)}>
          Sổ
        </Button>
      </Badge>

      <Modal
        title="Sổ ghi báo cáo"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        okText="Chốt và gửi"
        cancelText="Đóng"
        confirmLoading={submitting}
        okButtonProps={{ disabled: items.length === 0 }}
        width={760}
      >
        <Space orientation="vertical" size={12} style={{ width: "100%" }}>
          <Space style={{ justifyContent: "space-between", width: "100%" }}>
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              style={{ maxWidth: 180 }}
            />
            <Typography.Text strong>Tổng SL: {totalQuantity}</Typography.Text>
          </Space>

          {items.length === 0 ? (
            <Empty description="Chưa có công đoạn trong sổ" />
          ) : (
            <Table
              size="small"
              dataSource={items}
              rowKey="id"
              pagination={false}
              scroll={{ x: 680 }}
              columns={[
                {
                  title: "Công đoạn",
                  dataIndex: "operation_name",
                  render: (value, record) => (
                    <Space orientation="vertical" size={0}>
                      <Typography.Text strong>{value}</Typography.Text>
                      <Typography.Text type="secondary">
                        {record.product_code ?? "N/A"} -{" "}
                        {record.product_name ?? "Sản phẩm"}
                      </Typography.Text>
                    </Space>
                  ),
                },
                {
                  title: "SL",
                  dataIndex: "quantity",
                  width: 120,
                  render: (value, record) => (
                    <InputNumber
                      min={1}
                      value={value}
                      onChange={(nextValue) => updateQuantity(record.id, nextValue)}
                      style={{ width: "100%" }}
                    />
                  ),
                },
                {
                  title: "Đơn giá",
                  dataIndex: "price",
                  width: 110,
                  render: (value) => Number(value ?? 0).toLocaleString("vi-VN"),
                },
                {
                  title: "",
                  width: 84,
                  render: (_, record) => (
                    <Button danger size="small" onClick={() => removeItem(record.id)}>
                      Xóa
                    </Button>
                  ),
                },
              ]}
            />
          )}
        </Space>
      </Modal>
    </>
  );
}
