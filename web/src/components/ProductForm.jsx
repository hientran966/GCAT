/* eslint-disable react-hooks/exhaustive-deps */
import { Modal, Form, Input, message } from "antd";
import { useEffect } from "react";

import ProductService from "@/services/Product.service";

const ProductForm = ({ open, onClose, onProductAdded, product }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (product) {
      form.setFieldsValue(product);
    } else {
      form.resetFields();
    }
  }, [product]);

  const submit = async () => {
    try {
      const values = await form.validateFields();

      if (product) {
        await ProductService.updateProduct(product.id, values);
        message.success("Cập nhật thành công");
      } else {
        await ProductService.createProduct(values);
        message.success("Thêm thành công");
      }

      form.resetFields();
      onClose();
      onProductAdded?.();
    } catch {
      message.error("Có lỗi xảy ra");
    }
  };

  return (
    <Modal
      open={open}
      title={product ? "Chỉnh sửa hàng" : "Thêm hàng"}
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
        <Form.Item
          label="Mã hàng"
          name="code"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Tên hàng"
          name="name"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Số lượng"
          name="total_quantity"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <Input type="number" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductForm;