import React, { useState } from "react";
import { Modal, Tabs, Button, message } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import Taba from "./Taba";
import axiosClient from "@/api/axiosClient";

interface SettingModalProps {
  areaId: string;
}
const { TabPane } = Tabs;

export default function SettingModal({ areaId }: SettingModalProps) {
  const [visible, setVisible] = useState(false);
  const [checkedKeys, setCheckedKeys] = useState(["2", "4", "5", "7"]);
  const [settingObj, setSettingObj] = useState<any>({}); 

  const handleOpen = async () => {
    setVisible(true);
    try {
      const res = await axiosClient.get(
        `/api/v1/ProjectArea/setting_jmm/${areaId}`
      );
      if (res.data?.success && res.data.result?.setting) {
        const parsed = JSON.parse(res.data.result.setting);
        setSettingObj(parsed); 
        if (parsed.checkedKeys && parsed.checkedKeys.length > 0) {
          setCheckedKeys(parsed.checkedKeys);
        }
      }
    } catch (err) {
      message.error("Không thể lấy dữ liệu setting");
    }
  };

  const handleOk = async () => {
    const newSetting = { ...settingObj, checkedKeys };
    try {
      await axiosClient.post("/api/v1/ProjectArea/setting_jmm", {
        projectAreaId: areaId,
        json: JSON.stringify(newSetting),
      });
      message.success("Lưu thành công!");
      setVisible(false);
    } catch (err) {
      message.error("Lưu thất bại!");
    }
  };

  return (
    <>
      <Button icon={<SettingOutlined />} onClick={handleOpen} />
      <Modal
        open={visible}
        onCancel={() => setVisible(false)}
        title="現場初期設定"
        width="95vw"
        style={{ top: 120 }}
        footer={[
          <Button key="cancel" onClick={() => setVisible(false)}>
            Cancel
          </Button>,
          <Button key="preview">Preview</Button>,
          <Button key="ok" type="primary" onClick={handleOk}>
            OK
          </Button>,
        ]}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="基準値" key="1">
            <Taba checkedKeys={checkedKeys} onCheckedChange={setCheckedKeys} />
          </TabPane>
          <TabPane tab="施工結果表" key="2" />
          <TabPane tab="固化材" key="3" />
        </Tabs>
      </Modal>
    </>
  );
}
