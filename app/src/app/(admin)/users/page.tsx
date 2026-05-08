"use client";

import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  TablePaginationConfig,
  Tag,
  message,
} from "antd";
import { useEffect, useState } from "react";
import {
  changePassword,
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  UserListParams,
} from "@/services/user.service";
import type { Role, User } from "@/services/types";
import { useRouter } from "next/navigation";

type UserFormValues = {
  phone: string;
  name: string;
  password?: string;
  role: Role;
};

type PasswordFormValues = {
  oldPassword: string;
  newPassword: string;
};

const roleColor: Record<Role, string> = {
  admin: "red",
  manager: "blue",
  worker: "green",
};

export default function UsersPage() {
  const router = useRouter();
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<UserListParams>({
    page: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form] = Form.useForm<UserFormValues>();
  const [passwordForm] = Form.useForm<PasswordFormValues>();

  const fetchData = async (params?: UserListParams) => {
    setLoading(true);

    try {
      const merged = {
        ...filters,
        ...params,
      };

      const res = await getUsers(merged);

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

  const handleRoleFilter = async (role?: Role) => {
    await fetchData({
      role,
      page: 1,
    });
  };

  const handleKeywordSearch = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    await fetchData({
      keyword: event.target.value || undefined,
      page: 1,
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
    form.setFieldValue("role", "worker");
    setOpen(true);
  };

  const openEdit = (record: User) => {
    setEditing(record);
    form.setFieldsValue({
      phone: record.phone,
      name: record.name,
      role: record.role,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);

    try {
      if (editing) {
        await updateUser(editing.id, {
          name: values.name,
          role: values.role,
        });
        message.success("Đã cập nhật người dùng");
      } else {
        await createUser({
          phone: values.phone,
          name: values.name,
          password: values.password ?? "",
          role: values.role,
        });
        message.success("Đã thêm người dùng");
      }

      setOpen(false);
      await fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  const openPasswordModal = (record: User) => {
    setEditing(record);
    passwordForm.resetFields();
    setPasswordOpen(true);
  };

  const handleChangePassword = async () => {
    if (!editing) return;
    const values = await passwordForm.validateFields();
    setSubmitting(true);

    try {
      await changePassword(editing.id, values);
      message.success("Đã đổi mật khẩu");
      setPasswordOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteUser(id);
    message.success("Đã xóa người dùng");
    await fetchData();
  };

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Space style={{ justifyContent: "space-between", width: "100%" }}>
        <h2 style={{ margin: 0 }}>Người dùng</h2>
        <Button type="primary" onClick={openCreate}>
          Thêm người dùng
        </Button>
      </Space>

      <Space wrap>
        <Select
          allowClear
          placeholder="Lọc vai trò"
          style={{ width: 180 }}
          onChange={handleRoleFilter}
          options={[
            { value: "admin", label: "Admin" },
            { value: "manager", label: "Manager" },
            { value: "worker", label: "Worker" },
          ]}
        />

        <Input
          allowClear
          placeholder="Tìm tên hoặc số điện thoại"
          style={{ width: 260 }}
          onChange={handleKeywordSearch}
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
        onRow={(record) => ({
          onClick: () => router.push(`/users/${record.id}`),
          style: { cursor: "pointer" },
        })}
        columns={[
          { title: "Tên", dataIndex: "name" },
          { title: "Số điện thoại", dataIndex: "phone" },
          {
            title: "Vai trò",
            dataIndex: "role",
            render: (role: Role) => <Tag color={roleColor[role]}>{role}</Tag>,
          },
          {
            title: "Thao tác",
            width: 260,
            render: (_, record) => (
              <Space onClick={(event) => event.stopPropagation()}>
                <Button onClick={() => openEdit(record)}>Sửa</Button>
                <Button onClick={() => openPasswordModal(record)}>
                  Mật khẩu
                </Button>
                <Popconfirm
                  title="Xóa người dùng này?"
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
        title={editing ? "Sửa người dùng" : "Thêm người dùng"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
            <Input disabled={Boolean(editing)} />
          </Form.Item>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {!editing && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "admin", label: "Admin" },
                { value: "manager", label: "Manager" },
                { value: "worker", label: "Worker" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Đổi mật khẩu${editing ? ` - ${editing.name}` : ""}`}
        open={passwordOpen}
        onCancel={() => setPasswordOpen(false)}
        onOk={handleChangePassword}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="oldPassword"
            label="Mật khẩu cũ"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
