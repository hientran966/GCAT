import {
  Modal,
  Form,
  Input,
  message,
} from "antd";

import ProductService from "@/services/Product.service";

const ProductForm = ({ open, onClose, onProductAdded }) => {
  /* ================= FORM ================= */
  const [form] = Form.useForm();

  /* ================= SUBMIT ================= */
  const submit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {...values};

      await ProductService.createProduct(payload);

      message.success("Tạo dự án thành công");
      form.resetFields();
      onClose();
      onProductAdded?.();
    } catch {
      message.error("Lỗi tạo dự án");
    }
  };

  return (
    <>
      <Modal
        open={open}
        title="Thêm Hàng Mới"
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
          initialValues={{ status: "Lên kế hoạch" }}
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
    </>
  );
};

export default ProductForm;