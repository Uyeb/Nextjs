import React, { useEffect, useState } from "react";
import { Modal, Form, Select, message, Divider, Button } from "antd";
import axiosClient from "@/api/axiosClient";
import { PlusOutlined, SyncOutlined } from "@ant-design/icons";

interface AreaModalProps {
  mode: "create" | "edit";
  projectId: string;
  area?: {
    id: string;
    name: string;
  };
  onAreaChanged: () => void;
  buttonStyle?: React.CSSProperties;
  areaType?: 0 | 1;
}

const AreaModal: React.FC<AreaModalProps> = ({
  mode,
  projectId,
  area,
  onAreaChanged,
  buttonStyle,
  areaType = 0,
}) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [filterOptions, setFilterOptions] = useState<
    { id: string; name: string; stageName: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [areaInfoLoaded, setAreaInfoLoaded] = useState(false);

  const isEdit = mode === "edit" && area?.id;

  const loadFilters = async () => {
    try {
      const res = await axiosClient.post("/api/v1/admin/settings/filter", {});
      setFilterOptions(res.data.result?.items || []);
    } catch (error) {
      message.error("Failed to load setting list");
    }
  };

  const loadAreaInfo = async () => {
    if (!isEdit) return;

    try {
      const res = await axiosClient.get(`/api/v1/ProjectArea/${area?.id}`);
      const { typeofWork } = res.data.result;

      if (typeofWork) {
        const workIds = JSON.parse(typeofWork);
        const selected = filterOptions.find((item) => item.id === workIds[0]);

        if (selected) {
          form.setFieldsValue({ filterId: selected.stageName });
        }
      }
      setAreaInfoLoaded(true);
    } catch (error) {
      message.error("Failed to load area info");
    }
  };

  const openModal = () => {
    form.resetFields();
    setVisible(true);
  };

  const closeModal = () => {
    form.resetFields();
    setVisible(false);
  };

  useEffect(() => {
    if (visible) {
      loadFilters();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && isEdit && filterOptions.length > 0) {
      loadAreaInfo();
    }
  }, [visible, isEdit, filterOptions]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const selected = filterOptions.find(
        (item) => item.stageName === values.filterId
      );

      if (!selected) {
        message.error("Invalid filter selected");
        return;
      }

      const payload = {
        typeOfWork: selected.id,
        type: areaType,
        projectId,
      };

      setLoading(true);

      if (isEdit) {
        await axiosClient.put(
          `/api/v2/ProjectArea/update/${area?.id}`,
          payload
        );
        message.success("Area updated successfully");
      } else {
        await axiosClient.post("/api/v2/ProjectArea", payload);
        message.success("Area added successfully");
      }

      closeModal();
      onAreaChanged();
    } catch (error) {
      message.error(isEdit ? "Failed to update area" : "Failed to add area");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type={mode === "create" ? "primary" : "default"}
        icon={mode === "create" ? <PlusOutlined /> : <SyncOutlined />}
        onClick={openModal}
        style={
          mode === "edit"
            ? {
                backgroundColor: "#fff",
                border: "1px solid #d9d9d9",
                ...buttonStyle,
              }
            : buttonStyle
        }
      >
        {mode === "create"
          ? areaType === 0
            ? "Add new Area"
            : "Report Creation"
          : null}
      </Button>

      <Modal
        open={visible}
        onCancel={closeModal}
        title={
          <span style={{ fontWeight: 600 }}>
            {mode === "edit"
              ? "Edit Area"
              : areaType === 0
              ? "Add new area"
              : "Create Report"}
          </span>
        }
        confirmLoading={loading}
        onOk={handleSubmit}
        destroyOnHidden
        okText={mode === "create" ? "Add Area" : "Update Area"}
        footer={[
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleSubmit}
          >
            {mode === "edit"
              ? "Update Area"
              : areaType === 0
              ? "Add Area"
              : "Create Report"}
          </Button>,
        ]}
      >
        <Divider />
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 18 }}
        >
          <Form.Item
            label="Setting construction:"
            name="filterId"
            rules={[{ required: true, message: "Please select setting" }]}
          >
            <Select placeholder="Please select setting" showSearch>
              {filterOptions.map((item) => (
                <Select.Option key={item.stageName} value={item.stageName}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AreaModal;
