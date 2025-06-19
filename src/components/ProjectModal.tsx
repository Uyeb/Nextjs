import React, { useState, useEffect, CSSProperties } from "react";
import { Button, Modal, Form, Input, Typography, Row, Col, Divider } from "antd";
import axiosClient from "@/api/axiosClient";
import { SettingOutlined } from "@ant-design/icons";

const { Text } = Typography;

type Project = {
  id: string;
  name: string;
  province: string;
  companyName: string;
  contractorName: string;
  createdBy: string;
  sizeUnit: string;
  totalArea: number;
};

type ProjectModalProps = {
  project?: Partial<Project>;
  onProjectChanged?: () => void;
  mode?: "create" | "edit";
  buttonStyle?: CSSProperties;
};

const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onProjectChanged,
  mode = "create",
  buttonStyle,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!form) return;

    if (isModalOpen && isEdit && project) {
      form.setFieldsValue(project);
    } else if (isModalOpen && !isEdit) {
      form.resetFields();
    }
  }, [isModalOpen, isEdit, project]);


  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) =>
        formData.append(key, String(value))
      );

      const url = isEdit ? `/api/v2/Project/${project?.id}` : "/api/v2/Project";
      const method = isEdit ? "put" : "post";

      await axiosClient({
        method,
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsModalOpen(false);
      form.resetFields();
      onProjectChanged?.(); 
    } catch (error) {
      console.error(`${isEdit ? "Update" : "Create"} project error:`, error);
    }
  };

  const renderExtraInfo = () => (
    <>
      <Divider />
      <Row gutter={[16, 8]}>
        {[
          { label: "Created by:", value: project?.createdBy },
          { label: "Data size:", value: project?.sizeUnit },
          { label: "Total area:", value: project?.totalArea },
        ].map(({ label, value }) => (
          <React.Fragment key={label}>
            <Col span={8}>
              <Text strong>{label}</Text>
            </Col>
            <Col span={16}>
              <Text>{value}</Text>
            </Col>
          </React.Fragment>
        ))}
      </Row>
    </>
  );

  return (
    <>
      <Button
        type={isEdit ? "default" : "primary"}
        onClick={showModal}
        style={isEdit ? { backgroundColor: "white", border: "1px solid #d9d9d9" } : buttonStyle}
      >
        {isEdit ? (
          <SettingOutlined style={{ color: "black", fontSize: 20 }} />
        ) : (
          "+ Create Project"
        )}
      </Button>

      <Modal
        title={isEdit ? "Edit Project" : "Create Project"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnHidden
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          layout="horizontal"
        >
          {[
            { name: "name", label: "Project name" },
            { name: "province", label: "Province" },
            { name: "companyName", label: "Company name" },
          ].map(({ name, label }) => (
            <Form.Item
              key={name}
              label={label}
              name={name}
              rules={[{ required: true, message: `Please input ${label.toLowerCase()}!` }]}
            >
              <Input placeholder={`Input ${label.toLowerCase()}`} />
            </Form.Item>
          ))}

          {!isEdit && (
            <Form.Item
              label="Contractor name"
              name="contractorName"
              rules={[{ required: true, message: "Please input contractor name!" }]}
            >
              <Input placeholder="Input contractor name" />
            </Form.Item>
          )}
        </Form>

        {isEdit && project && renderExtraInfo()}
      </Modal>
    </>
  );
};

export default ProjectModal;
