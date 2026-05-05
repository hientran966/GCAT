"use client";

import { Form, Input, InputNumber, Modal, Space, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { addReportBookItem } from "@/components/worker/report-book";
import type { Assignment } from "@/services/types";

type ReportModalProps = {
  assignment: Assignment;
  onClose: () => void;
  onSuccess?: () => void;
};

type ReportFormValues = {
  quantity: number;
  report_date?: string;
};

const today = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

export default function ReportModal({
  assignment,
  onClose,
  onSuccess,
}: ReportModalProps) {
  const [form] = Form.useForm<ReportFormValues>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    form.setFieldsValue({ quantity: 1, report_date: today() });
  }, [assignment.id, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);

    try {
      addReportBookItem(assignment, values.quantity, values.report_date);
      message.success("Đã thêm vào sổ báo cáo");
      onSuccess?.();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Ghi vào sổ báo cáo"
      open
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Thêm vào sổ"
      cancelText="Đóng"
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Space orientation="vertical" size={4} style={{ marginBottom: 16 }}>
        <Typography.Text strong>{assignment.operation_name}</Typography.Text>
        <Typography.Text type="secondary">
          {assignment.product_code} - Đơn giá{" "}
          {Number(assignment.price ?? 0).toLocaleString("vi-VN")}
        </Typography.Text>
      </Space>

      <Form form={form} layout="vertical">
        <Form.Item
          name="quantity"
          label="Số lượng hoàn thành"
          rules={[{ required: true, message: "Nhập số lượng" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="report_date" label="Ngày báo cáo">
          <Input type="date" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
