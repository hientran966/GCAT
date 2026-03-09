/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Modal,
  Form,
  Input,
  message,
  Select,
} from "antd";

import AssignService from "@/services/Assign.service";
import { selectFilteredStages } from "@/stores/stageSelectors";

const AssignForm = ({ open, onClose, onAssignAdded, assign }) => {
  const stages = useSelector(selectFilteredStages);

  const [form] = Form.useForm();
  const [selectedStage, setSelectedStage] = useState(null);

  useEffect(() => {
    if (assign) {
      form.setFieldsValue(assign);

      const stage = stages.find((p) => p.code === assign.stage_code);
      setSelectedStage(stage);
    } else {
      form.resetFields();
      setSelectedStage(null);
    }
  }, [assign]);

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const stage = stages.find((p) => p.id === values.stage_id);

      const formData = new FormData();

      formData.append("stage_id", stage?.id);
      formData.append("account_id", values.account_id);
      formData.append("assigned_quantity", values.assigned_quantity);

      if (assign) {
        await AssignService.updateAssign(assign.id, formData);
        message.success("Cập nhật thành công");
      } else {
        await AssignService.createAssign(formData);
        message.success("Thêm thành công");
      }

      form.resetFields();
      setSelectedStage(null);

      onClose();
      onAssignAdded?.();
    } catch {
      message.error("Có lỗi xảy ra");
    }
  };

  return (
    <Modal
      open={open}
      title={assign ? "Chỉnh sửa phân công" : "Thêm phân công"}
      width={600}
      onCancel={onClose}
      onOk={submit}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        {/* STAGE */}
        <Form.Item
          label="Công đoạn"
          name="stage_id"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <Select
            showSearch
            placeholder="Nhập để tìm công đoạn"
            optionFilterProp="children"
            onChange={(value) => {
              const stage = stages.find((p) => p.id === value);
              setSelectedStage(stage);
            }}
          >
            {stages.map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.code}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* WORKER */}
        <Form.Item
          label="Nhân công"
          name="account_id"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <Input />
        </Form.Item>

        {/* QUANTITY */}
        <Form.Item
          label="Số lượng"
          name="assigned_quantity"
          rules={[
            { required: true, message: "Bắt buộc" },
            {
              validator: (_, value) => {
                if (!selectedStage) return Promise.resolve();
                if (value > selectedStage.stage_quantity) {
                  return Promise.reject(
                    new Error(
                      `Không được vượt quá ${selectedStage.stage_quantity}`
                    )
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input type="number" max={selectedStage?.total_quantity} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AssignForm;