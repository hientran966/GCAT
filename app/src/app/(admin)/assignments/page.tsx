"use client";

import {
  Button,
  Form,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  message,
} from "antd";
import { useEffect, useState } from "react";
import {
  createAssignment,
  deleteAssignment,
  getAssignments,
} from "@/services/assignment.service";
import { getOperations } from "@/services/operation.service";
import { getUsers } from "@/services/user.service";
import type { Assignment, Operation, User } from "@/services/types";

type AssignmentFormValues = {
  worker_id: number;
  operation_id: number;
};

export default function AssignmentsPage() {
  const [data, setData] = useState<Assignment[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<AssignmentFormValues>();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assignmentsRes, workersRes, operationsRes] = await Promise.all([
        getAssignments({ limit: 100 }),
        getUsers({ role: "worker", limit: 100 }),
        getOperations({ limit: 100 }),
      ]);
      setData(assignmentsRes.data);
      setWorkers(workersRes.data);
      setOperations(operationsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);

    try {
      await createAssignment(values);
      message.success("Đã thêm phân công");
      setOpen(false);
      form.resetFields();
      await fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteAssignment(id);
    message.success("Đã xóa phân công");
    await fetchData();
  };

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Space style={{ justifyContent: "space-between", width: "100%" }}>
        <h2 style={{ margin: 0 }}>Phân công</h2>
        <Button
          type="primary"
          onClick={() => {
            form.resetFields();
            setOpen(true);
          }}
        >
          Thêm phân công
        </Button>
      </Space>

      <Table
        loading={loading}
        dataSource={data}
        rowKey="id"
        columns={[
          { title: "Công nhân", dataIndex: "worker_name" },
          { title: "Công đoạn", dataIndex: "operation_name" },
          { title: "Mã sản phẩm", dataIndex: "product_code" },
          {
            title: "Đơn giá",
            dataIndex: "price",
            render: (price) => Number(price ?? 0).toLocaleString("vi-VN"),
          },
          {
            title: "Thao tác",
            width: 100,
            render: (_, record) => (
              <Popconfirm
                title="Xóa phân công này?"
                onConfirm={() => handleDelete(record.id)}
              >
                <Button danger>Xóa</Button>
              </Popconfirm>
            ),
          },
        ]}
      />

      <Modal
        title="Thêm phân công"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="worker_id"
            label="Công nhân"
            rules={[{ required: true }]}
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
            rules={[{ required: true }]}
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
