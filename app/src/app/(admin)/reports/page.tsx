"use client";

import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
  DatePicker,
  TablePaginationConfig,
} from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  createReport,
  getReports,
  ReportListParams,
  updateReport,
} from "@/services/report.service";
import { getAssignments } from "@/services/assignment.service";
import type { Assignment, Report } from "@/services/types";

type ReportFormValues = {
  assignment_id?: number;
  quantity: number;
  report_date?: string;
};

const statusColor: Record<string, string> = {
  pending: "gold",
  approved: "green",
  rejected: "red",
};

export default function ReportsPage() {
  const [data, setData] = useState<Report[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ReportListParams>({
    page: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Report | null>(null);
  const [form] = Form.useForm<ReportFormValues>();

  const fetchData = async (params?: ReportListParams) => {
    setLoading(true);

    try {
      const merged = {
        ...filters,
        ...params,
      };

      const reportsRes = await getReports(merged);

      setData(reportsRes.data);
      setTotal(reportsRes.total);
      setFilters(merged);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    const assignmentsRes = await getAssignments({ limit: 100 });
    setAssignments(assignmentsRes.data);
  };

  useEffect(() => {
    fetchData();
    fetchAssignments();
  }, []);

  const handleWorkerFilter = async (workerId?: number) => {
    await fetchData({
      worker_id: workerId,
    });
  };

  const handleDateFilter = async (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
  ) => {
    await fetchData({
      from_date: dates?.[0]
        ? dates[0].format("YYYY-MM-DD")
        : undefined,
      to_date: dates?.[1]
        ? dates[1].format("YYYY-MM-DD")
        : undefined,
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

  const openEdit = (record: Report) => {
    setEditing(record);
    form.setFieldsValue({ quantity: record.quantity });
    setOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);

    try {
      if (editing) {
        await updateReport(editing.id, { quantity: values.quantity });
        message.success("Đã cập nhật báo cáo");
      } else {
        await createReport({
          assignment_id: values.assignment_id ?? "",
          quantity: values.quantity,
          report_date: values.report_date,
        });
        message.success("Đã thêm báo cáo");
      }

      setOpen(false);
      await fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Space style={{ justifyContent: "space-between", width: "100%" }}>
        <h2 style={{ margin: 0 }}>Báo cáo sản lượng</h2>
        <Button type="primary" onClick={openCreate}>
          Thêm báo cáo
        </Button>
      </Space>

      <Space wrap>
        <Select
          allowClear
          placeholder="Lọc công nhân"
          style={{ width: 250 }}
          onChange={handleWorkerFilter}
          options={[
            ...new Map(
              assignments.map((a) => [
                a.worker_id,
                {
                  value: a.worker_id,
                  label: a.worker_name ?? "N/A",
                },
              ]),
            ).values(),
          ]}
        />

        <DatePicker.RangePicker
          format="DD/MM/YYYY"
          onChange={handleDateFilter}
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
          { title: "Số lượng", dataIndex: "quantity" },
          {
            title: "Đơn giá",
            dataIndex: "price",
            render: (price) => Number(price ?? 0).toLocaleString("vi-VN"),
          },
          {
            title: "Thành tiền",
            render: (_, record) =>
              (Number(record.price ?? 0) * record.quantity).toLocaleString(
                "vi-VN",
              ),
          },
          {
            title: "Ngày",
            dataIndex: "report_date",
            render: (value?: string) =>
              value ? new Date(value).toLocaleDateString("vi-VN") : "",
          },
          {
            title: "Trạng thái",
            dataIndex: "status",
            render: (status?: string) =>
              status ? (
                <Tag color={statusColor[status] ?? "default"}>{status}</Tag>
              ) : null,
          },
          {
            title: "Thao tác",
            width: 100,
            render: (_, record) => (
              <Button onClick={() => openEdit(record)}>Sửa</Button>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? "Sửa báo cáo" : "Thêm báo cáo"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          {!editing && (
            <Form.Item
              name="assignment_id"
              label="Phân công"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                options={assignments.map((assignment) => ({
                  value: assignment.id,
                  label: `${assignment.worker_name ?? "N/A"} - ${
                    assignment.operation_name ?? "N/A"
                  } - ${assignment.product_code ?? "N/A"}`,
                }))}
              />
            </Form.Item>
          )}
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          {!editing && (
            <Form.Item name="report_date" label="Ngày báo cáo">
              <Input type="date" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Space>
  );
}
