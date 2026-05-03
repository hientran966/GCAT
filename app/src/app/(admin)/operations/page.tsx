"use client";

import {
  Button,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Upload,
  message,
} from "antd";
import type { UploadFile } from "antd";
import { useEffect, useState } from "react";
import { resolveFileUrl } from "@/services/api";
import {
  createOperation,
  deleteOperation,
  getOperations,
  updateOperation,
} from "@/services/operation.service";
import { getProducts } from "@/services/product.service";
import type { Operation, Product } from "@/services/types";

type OperationFormValues = {
  name: string;
  price: number;
  product_id: number;
  file?: UploadFile[];
};

export default function OperationsPage() {
  const [data, setData] = useState<Operation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Operation | null>(null);
  const [form] = Form.useForm<OperationFormValues>();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [operationsRes, productsRes] = await Promise.all([
        getOperations({ limit: 100 }),
        getProducts({ limit: 100 }),
      ]);
      setData(operationsRes.data);
      setProducts(productsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: Operation) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      price: Number(record.price),
      product_id: record.product_id,
      file: [],
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const file = values.file?.[0]?.originFileObj;
    setSubmitting(true);

    try {
      const payload = {
        name: values.name,
        price: values.price,
        product_id: values.product_id,
        file,
      };

      if (editing) {
        await updateOperation(editing.id, payload);
        message.success("Đã cập nhật công đoạn");
      } else {
        await createOperation(payload);
        message.success("Đã thêm công đoạn");
      }

      setOpen(false);
      await fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteOperation(id);
    message.success("Đã xóa công đoạn");
    await fetchData();
  };

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Space style={{ justifyContent: "space-between", width: "100%" }}>
        <h2 style={{ margin: 0 }}>Công đoạn</h2>
        <Button type="primary" onClick={openCreate}>
          Thêm công đoạn
        </Button>
      </Space>

      <Table
        loading={loading}
        dataSource={data}
        rowKey="id"
        columns={[
          {
            title: "Ảnh",
            dataIndex: "image",
            width: 96,
            render: (image?: string) =>
              image ? (
                <Image
                  src={resolveFileUrl(image)}
                  alt="operation"
                  width={56}
                  height={56}
                  style={{ objectFit: "cover", borderRadius: 6 }}
                />
              ) : null,
          },
          { title: "Tên", dataIndex: "name" },
          { title: "Mã sản phẩm", dataIndex: "product_code" },
          {
            title: "Giá",
            dataIndex: "price",
            render: (price) => Number(price).toLocaleString("vi-VN"),
          },
          {
            title: "Thao tác",
            width: 160,
            render: (_, record) => (
              <Space>
                <Button onClick={() => openEdit(record)}>Sửa</Button>
                <Popconfirm
                  title="Xóa công đoạn này?"
                  onConfirm={() => handleDelete(record.id)}
                >
                  <Button danger>Xóa</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? "Sửa công đoạn" : "Thêm công đoạn"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="product_id"
            label="Sản phẩm"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={products.map((product) => ({
                value: product.id,
                label: `${product.code} - ${product.name}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="name" label="Tên công đoạn" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Đơn giá" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="file"
            label="Ảnh"
            valuePropName="fileList"
            getValueFromEvent={(event) => event?.fileList}
          >
            <Upload beforeUpload={() => false} maxCount={1} listType="picture">
              <Button>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
