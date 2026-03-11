/* eslint-disable react-hooks/exhaustive-deps */
import { Modal, Form, Input, message, Upload, Select } from "antd";
import { useEffect, useState } from "react";

import AccountService from "@/services/Account.service";

const AccountForm = ({ open, onClose, onAccountAdded, account }) => {
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState([]);
  const [preview, setPreview] = useState({
    visible: false,
    image: "",
  });

  useEffect(() => {
    if (account) {
      form.setFieldsValue(account);

      if (account.image_url) {
        setFileList([
          {
            uid: "-1",
            name: "image",
            status: "done",
            url: `http://localhost:3000/${account.image_url.replace(/\\/g, "/")}`,
          },
        ]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [account]);

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

      formData.append("phone", values.phone);
      formData.append("name", values.name);
      formData.append("role", values.role);
      formData.append("address", values.address);

      if (fileList[0]?.originFileObj) {
        formData.append("file", fileList[0].originFileObj);
      }

      if (account) {
        await AccountService.updateAccount(account.id, formData);
        message.success("Cập nhật thành công");
      } else {
        await AccountService.createAccount(formData);
        message.success("Thêm thành công");
      }

      form.resetFields();
      setFileList([]);
      onClose();
      onAccountAdded?.();
    } catch {
      message.error("Có lỗi xảy ra");
    }
  };

  return (
    <>
      <Modal
        open={open}
        title={account ? "Chỉnh sửa công nhân" : "Thêm công nhân"}
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
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Bắt buộc" },
              { pattern: /^\d+$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Tên công nhân"
            name="name"
            rules={[{ required: true, message: "Bắt buộc" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: "Bắt buộc" }]}
          >
            <Select>
              <Select.Option value="user">Công nhân</Select.Option>
              <Select.Option value="manager">Quản lý</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
          >
            <Input />
          </Form.Item>

          <Form.Item label="Ảnh đại diện">
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

export default AccountForm;