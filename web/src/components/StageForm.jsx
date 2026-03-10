/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Modal,
  Form,
  Input,
  message,
  Select,
  Upload,
  Button,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

import StageService from "@/services/Stage.service";
import { fetchProducts } from "@/stores/productSlice";
import { selectFilteredProducts } from "@/stores/productSelectors";

const StageForm = ({ open, onClose, onStageAdded, stage }) => {
  const products = useSelector(selectFilteredProducts);

  const [form] = Form.useForm();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (stage) {
      form.setFieldsValue(stage);

      const product = products.find((p) => p.code === stage.product_code);
      setSelectedProduct(product);

      if (stage.image_url) {
        setFileList([
          {
            uid: "-1",
            name: "image",
            status: "done",
            url: `http://localhost:3000/${stage.image_url.replace(/\\/g, "/")}`,
          },
        ]);
      }
    } else {
      form.resetFields();
      setSelectedProduct(null);
      setFileList([]);
    }
    fetchProducts();
  }, [stage]);

  const submit = async () => {
    try {
      const values = await form.validateFields();
      const product = products.find((p) => p.code === values.product_code);

      const formData = new FormData();

      formData.append("product_id", product?.id);
      formData.append("stage_name", values.stage_name);
      formData.append("price", values.price);
      formData.append("stage_quantity", values.stage_quantity);

      if (fileList[0]?.originFileObj) {
        formData.append("file", fileList[0].originFileObj);
      }

      if (stage) {
        await StageService.updateStage(stage.id, formData);
        message.success("Cập nhật thành công");
      } else {
        await StageService.createStage(formData);
        message.success("Thêm thành công");
      }

      form.resetFields();
      setSelectedProduct(null);
      setFileList([]);

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
              form.setFieldsValue({ stage_quantity: undefined });
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
          dependencies={["product_code"]}
          rules={[
            { required: true, message: "Bắt buộc" },
            {
              validator: (_, value) => {
                if (!selectedProduct) return Promise.resolve();
                
                const numValue = Number(value);
                if (isNaN(numValue) || numValue <= 0) {
                  return Promise.reject(new Error("Số lượng phải là số dương"));
                }

                if (numValue > selectedProduct.total_quantity){
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
          <Input type="number" max={selectedProduct?.total_quantity} />
        </Form.Item>

        {/* PRICE */}
        <Form.Item
          label="Giá"
          name="price"
          rules={[{ required: true, message: "Bắt buộc" }]}
        >
          <Input type="number" />
        </Form.Item>

        {/* IMAGE */}
        <Form.Item label="Hình ảnh">
          <Upload
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            maxCount={1}
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StageForm;