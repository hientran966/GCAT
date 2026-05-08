"use client";

import {
  Button,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  Upload,
  message,
} from "antd";
import type { TablePaginationConfig, UploadFile } from "antd";
import { useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  ProductListParams,
} from "@/services/product.service";
import { resolveFileUrl } from "@/services/api";
import type { Product } from "@/services/types";

type ProductFormValues = {
  code: string;
  name: string;
  supplier?: string;
  total_quantity?: number;
  file?: UploadFile[];
};

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ProductListParams>({
    page: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form] = Form.useForm<ProductFormValues>();

  const fetchData = async (params?: ProductListParams) => {
    setLoading(true);

    try {
      const merged = {
        ...filters,
        ...params,
      };

      const res = await getProducts(merged);

      setData(res.data);
      setTotal(res.total);
      setFilters(merged);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleKeywordSearch = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    await fetchData({
      keyword: event.target.value || undefined,
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

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: Product) => {
    setEditing(record);
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      supplier: record.supplier ?? undefined,
      total_quantity: record.total_quantity
        ? Number(record.total_quantity)
        : undefined,
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
        code: values.code,
        name: values.name,
        supplier: values.supplier,
        total_quantity: values.total_quantity,
        file,
      };

      if (editing) {
        await updateProduct(editing.id, payload);
        message.success("Đã cập nhật sản phẩm");
      } else {
        await createProduct(payload);
        message.success("Đã thêm sản phẩm");
      }

      setOpen(false);
      await fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteProduct(id);
    message.success("Đã xóa sản phẩm");
    await fetchData();
  };

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Space style={{ justifyContent: "space-between", width: "100%" }}>
        <h2 style={{ margin: 0 }}>Sản phẩm</h2>
        <Button type="primary" onClick={openCreate}>
          Thêm sản phẩm
        </Button>
      </Space>

      <Input
        allowClear
        placeholder="Tìm tên sản phẩm"
        style={{ width: 280 }}
        onChange={handleKeywordSearch}
      />

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
          {
            title: "Ảnh",
            dataIndex: "image",
            width: 96,
            render: (image?: string) =>
              image ? (
                <Image
                  src={resolveFileUrl(image)}
                  alt="product"
                  width={56}
                  height={56}
                  style={{ objectFit: "cover", borderRadius: 6 }}
                />
              ) : null,
          },
          { title: "Mã", dataIndex: "code" },
          { title: "Tên", dataIndex: "name" },
          { title: "Nhà cung cấp", dataIndex: "supplier" },
          { title: "Số lượng", dataIndex: "total_quantity" },
          {
            title: "Thao tác",
            width: 160,
            render: (_, record) => (
              <Space>
                <Button onClick={() => openEdit(record)}>Sửa</Button>
                <Popconfirm
                  title="Xóa sản phẩm này?"
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
        title={editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Mã" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="supplier" label="Nhà cung cấp">
            <Input />
          </Form.Item>
          <Form.Item name="total_quantity" label="Số lượng">
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
