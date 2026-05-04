"use client";

import {
  Button,
  Card,
  Empty,
  Form,
  Image,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  createAssignment,
  getUserAssignments,
} from "@/services/assignment.service";
import { resolveFileUrl } from "@/services/api";
import { getOperations } from "@/services/operation.service";
import { getUsers } from "@/services/user.service";
import type { Assignment, Operation, User } from "@/services/types";
import ReportModal from "@/components/worker/report-modal";

type AssignmentFormValues = {
  worker_id: number;
  operation_id: number;
};

const readStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function JobsPage() {
  const [data, setData] = useState<Assignment[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [workerId, setWorkerId] = useState<number>();
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<AssignmentFormValues>();

  const fetchOptions = async () => {
    const [workersRes, operationsRes] = await Promise.all([
      getUsers({ role: "worker", limit: 100 }),
      getOperations({ limit: 100 }),
    ]);

    setWorkers(workersRes.data);
    setOperations(operationsRes.data);

    const storedUser = readStoredUser();
    const defaultWorkerId =
      storedUser?.role === "worker" ? storedUser.id : workersRes.data[0]?.id;
    setWorkerId((current) => current ?? defaultWorkerId);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserAssignments();
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  const openAssign = () => {
    form.resetFields();
    if (workerId) form.setFieldValue("worker_id", workerId);
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    const values = await form.validateFields();
    setSubmitting(true);

    try {
      await createAssignment(values);
      message.success("Đã giao công đoạn");
      setAssignOpen(false);
      setWorkerId(values.worker_id);
      await fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (workerId) fetchData();
  }, [fetchData, workerId]);

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Card size="small">
        <Space orientation="vertical" size={12} style={{ width: "100%" }}>
          <Space
            align="start"
            style={{ justifyContent: "space-between", width: "100%" }}
          >
            <Button type="primary" onClick={openAssign}>
              Giao việc
            </Button>
          </Space>
        </Space>
      </Card>

      <Spin spinning={loading}>
        {data.length === 0 ? (
          <Card>
            <Empty description="Chưa có công đoạn được giao" />
          </Card>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {data.map((item) => (
              <Card
                key={item.id}
                size="small"
                cover={
                  item.operation_image ? (
                    <Image
                      src={resolveFileUrl(item.operation_image)}
                      alt={item.operation_name}
                      height={160}
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        height: 120,
                        background: "#f0f2f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography.Text type="secondary">
                        Chưa có ảnh
                      </Typography.Text>
                    </div>
                  )
                }
                actions={[
                  <Button
                    key="report"
                    type="primary"
                    onClick={() => setSelected(item)}
                  >
                    Báo cáo
                  </Button>,
                ]}
              >
                <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                  <Space
                    style={{ justifyContent: "space-between", width: "100%" }}
                  >
                    <Tag color="blue">{item.product_code ?? "N/A"}</Tag>
                    <Typography.Text strong>
                      {Number(item.price ?? 0).toLocaleString("vi-VN")}
                    </Typography.Text>
                  </Space>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {item.operation_name}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {item.product_name ?? "Sản phẩm không xác định"}
                  </Typography.Text>
                </Space>
              </Card>
            ))}
          </div>
        )}
      </Spin>

      {selected && (
        <ReportModal
          assignment={selected}
          onClose={() => setSelected(null)}
          onSuccess={() => fetchData()}
        />
      )}

      <Modal
        title="Giao công đoạn"
        open={assignOpen}
        onCancel={() => setAssignOpen(false)}
        onOk={handleAssign}
        okText="Giao việc"
        cancelText="Đóng"
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="worker_id"
            label="Công nhân"
            rules={[{ required: true, message: "Chọn công nhân" }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={workers.map((worker) => ({
                value: worker.id,
                label: `${worker.name} - ${worker.phone}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="operation_id"
            label="Công đoạn"
            rules={[{ required: true, message: "Chọn công đoạn" }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={operations.map((operation) => ({
                value: operation.id,
                label: `${operation.product_code ?? "N/A"} - ${operation.name}`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
