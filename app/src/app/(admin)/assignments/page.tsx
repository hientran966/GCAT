"use client";

import {
  Button,
  Form,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  TablePaginationConfig,
  message,
} from "antd";
import { useEffect, useState } from "react";
import {
  createAssignment,
  deleteAssignment,
  getAssignments,
  AssignmentListParams,
} from "@/services/assignment.service";
import { getOperations } from "@/services/operation.service";
import { getProducts } from "@/services/product.service";
import { getUsers } from "@/services/user.service";
import type {
  Assignment,
  Operation,
  Product,
  User,
} from "@/services/types";

type AssignmentFormValues = {
  worker_id: number;
  operation_id: number;
};

export default function AssignmentsPage() {
  const [data, setData] = useState<Assignment[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<AssignmentListParams>({
    page: 1,
    limit: 10,
  });
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<AssignmentFormValues>();

  const fetchData = async (params?: AssignmentListParams) => {
    setLoading(true);

    try {
      const merged = {
        ...filters,
        ...params,
      };

      const [
        assignmentsRes,
        workersRes,
        operationsRes,
        productsRes,
      ] = await Promise.all([
        getAssignments(merged),
        getUsers({ role: "worker", limit: 100 }),
        getOperations({ limit: 100 }),
        getProducts({ limit: 100 }),
      ]);

      setData(assignmentsRes.data);
      setWorkers(workersRes.data);
      setOperations(operationsRes.data);
      setProducts(productsRes.data);
      setTotal(assignmentsRes.total);
      setFilters(merged);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWorkerFilter = async (workerId?: number) => {
    await fetchData({
      worker_id: workerId,
    });
  };

  const handleProductFilter = async (productId?: number) => {
    await fetchData({
      product_id: productId,
    });
  };

  const handleTableChange = async (
    pagination: TablePaginationConfig,
  ) => {
    await fetchData({
      page: pagination.current,
      limit: pagination.pageSize,
    });
  };

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

      <Space wrap>
        <Select
          allowClear
          placeholder="Lọc công nhân"
          style={{ width: 240 }}
          onChange={handleWorkerFilter}
          options={workers.map((worker) => ({
            value: worker.id,
            label: `${worker.name} - ${worker.phone}`,
          }))}
        />

        <Select
          allowClear
          placeholder="Lọc sản phẩm"
          style={{ width: 240 }}
          onChange={handleProductFilter}
          options={products.map((product) => ({
            value: product.id,
            label: `${product.code} - ${product.name}`,
          }))}
        />
      </Space>

      <Table
        loading={loading}
        dataSource={data}
        rowKey="id"
        onChange={handleTableChange}
        pagination={{
          current: filters.page,
          pageSize: filters.limit,
          total,
          showSizeChanger: true,
        }}
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
