// components/modals/AddAreaModal.tsx

import React, { useState, useEffect } from "react";
import { Modal, Form, Select, message, Divider, Button } from "antd";
import axiosClient from "@/api/axiosClient";

interface AddAreaModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
  projectId: string;
}

const AddAreaModal: React.FC<AddAreaModalProps> = ({
  visible,
  onCancel,
  onOk,
  projectId,
}) => {
  const [form] = Form.useForm();
  const [filterOptions, setFilterOptions] = useState<
    { id: string; name: string; stageName: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const getFilters = async () => {
    try {
      const res = await axiosClient.post("/api/v1/admin/settings/filter", {});
      setFilterOptions(res.data.result?.items || []);
    } catch (error: any) {
      console.error("getFilters error", error?.response?.data || error);
      message.error("Failed to load setting list");
    }
  };

  const handleSubmit = async () => {
  try {
    const values = await form.validateFields();

    // Tìm object tương ứng với filterId (thực tế là stageName)
    const selected = filterOptions.find(
      (item) => item.stageName === values.filterId
    );

    if (!selected) {
      message.error("Invalid filter selected");
      return;
    }
    
    const payload = {
      typeOfWork: selected.id,
      type: 0,
      projectId,
    };

    setLoading(true);
    await axiosClient.post("/api/v2/ProjectArea", payload);
    message.success("Area added successfully");
    form.resetFields();
    onOk();
  } catch (error) {
    console.error(error);
    message.error("Failed to add area");
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    form.resetFields();
    onCancel();
  };

  useEffect(() => {
    if (visible && filterOptions.length === 0) {
      getFilters();
    }
  }, [visible]);

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      title={
        <span style={{ color: "#f5222d", fontWeight: 600 }}>Add new area</span>
      }
      confirmLoading={loading}
      closable
      footer={[
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={loading}
        >
          Add area
        </Button>,
      ]}
    >
      <Divider
        style={{ margin: "12px 0", borderBlockStart: "1px solid #d9d9d9" }}
      />
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 18 }}
      >
        <Form.Item
          label="Setting construction:"
          name="filterId"
          rules={[
            { required: true, message: "Please select setting construction" },
          ]}
        >
          <Select placeholder="Please select setting construction" showSearch>
            {filterOptions.map((item) => (
              <Select.Option key={item.stageName} value={item.stageName}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddAreaModal;
