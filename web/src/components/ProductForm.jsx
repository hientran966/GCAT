/* eslint-disable react-hooks/exhaustive-deps */
import { Modal, Form, Input, message, Upload } from "antd";
import { useEffect, useState } from "react";

import ProductService from "@/services/Product.service";

const ProductForm = ({ open, onClose, onProductAdded, product }) => {
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState([]);
  const [preview, setPreview] = useState({
    visible: false,
    image: "",
  });

  useEffect(() => {
    if (product) {
      form.setFieldsValue(product);

      if (product.image_url) {
        setFileList([
          {
            uid: "-1",
            name: "image",
            status: "done",
            url: `http://localhost:3000/${product.image_url.replace(/\\/g, "/")}`,
          },
        ]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [product]);

  const handlePreview = async (file) => {
    let src = file.url;

    if (!src) {
      src = URL.createObjectURL(file.originFileObj);
    }

    setPreview({
      visible: true,
      image: src,
    });
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();

      const formData = new FormData();

      formData.append("code", values.code);
      formData.append("name", values.name);
      formData.append("total_quantity", values.total_quantity);

      if (fileList[0]?.originFileObj) {
        formData.append("file", fileList[0].originFileObj);
      }

      if (product) {
        await ProductService.updateProduct(product.id, formData);
        message.success("Cập nhật thành công");
      } else {
        await ProductService.createProduct(formData);
        message.success("Thêm thành công");
      }

      form.resetFields();
      setFileList([]);
      onClose();
      onProductAdded?.();
    } catch {
      message.error("Có lỗi xảy ra");
    }
  };

  return (
    <>
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

          <Form.Item label="Hình ảnh">
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList }) => setFileList(fileList)}
              onPreview={handlePreview}
              maxCount={1}
            >
              {fileList.length < 1 && "+ Upload"}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={preview.visible}
        footer={null}
        zIndex={2000}
        onCancel={() => setPreview({ visible: false, image: "" })}
      >
        <img
          alt="preview"
          style={{ width: "100%" }}
          src={preview.image}
        />
      </Modal>
    </>
  );
};

export default ProductForm;