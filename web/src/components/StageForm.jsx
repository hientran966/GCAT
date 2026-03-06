/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Modal, Form, Input, message, Select } from "antd";

import StageService from "@/services/Stage.service";
import { selectFilteredProducts } from "@/stores/productSelectors";

const StageForm = ({ open, onClose, onStageAdded, stage }) => {
  const products = useSelector(selectFilteredProducts);

  /* ================= FORM ================= */
  const [form] = Form.useForm();
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (stage) {
      form.setFieldsValue({
        ...stage,
        product_code: stage.product_code,
      });

      const product = products.find((p) => p.code === stage.product_code);
      setSelectedProduct(product);
    } else {
      form.resetFields();
      setSelectedProduct(null);
    }
  }, [stage]);

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const product = products.find((p) => p.code === values.product_code);

      const payload = {
        ...values,
        product_id: product?.id,
      };

      if (stage) {
        await StageService.updateStage(stage.id, payload);
        message.success("Cập nhật thành công");
      } else {
        await StageService.createStage(payload);
        message.success("Thêm thành công");
      }

      form.resetFields();
      setSelectedProduct(null);
      onClose();
      onStageAdded?.();
    } catch {
      message.error("Có lỗi xảy ra");
    }
  };

  return (
    <Modal
      open={open}
      title={stage ? "Chỉnh sửa công đoạn" : "Thêm công đoạn"}
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
        {/* PRODUCT CODE */}
        <Form.Item
          label="Mã hàng"
          name="product_code"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
        <Select
          showSearch
          placeholder="Nhập để tìm mã hàng"
          optionFilterProp="children"
          onChange={(value) => {
            const product = products.find((p) => p.code === value);
            setSelectedProduct(product);
          }}
        >
          {products.map((p) => (
            <Select.Option key={p.id} value={p.code}>
              {p.code}
            </Select.Option>
          ))}
        </Select>
        </Form.Item>

        {/* STAGE NAME */}
        <Form.Item
          label="Tên công đoạn"
          name="stage_name"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <Input />
        </Form.Item>

        {/* QUANTITY */}
        <Form.Item
          label="Số lượng"
          name="stage_quantity"
          rules={[
            { required: true, message: "Bắt buộc" },
            {
              validator: (_, value) => {
                if (!selectedProduct) return Promise.resolve();
                if (value > selectedProduct.total_quantity) {
                  return Promise.reject(
                    new Error(
                      `Không được vượt quá ${selectedProduct.total_quantity}`
                    )
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            type="number"
            max={selectedProduct?.total_quantity}
          />
        </Form.Item>

        {/* PRICE */}
        <Form.Item
          label="Giá"
          name="price"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <Input type="number" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StageForm;