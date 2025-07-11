import React from "react";
import { Checkbox, Table } from "antd";

interface TabaProps {
  checkedKeys: string[];
  onCheckedChange: (keys: string[]) => void;
}

const allColumns = [
  { title: "貫入時間", dataIndex: "貫入時間", key: "1", unit: "min/m" },
  { title: "改良時間", dataIndex: "改良時間", key: "2", unit: "min/m" },
  {
    title: "平均回転数【貫入】",
    dataIndex: "平均回転数【貫入】",
    key: "3",
    unit: "rpm",
  },
  {
    title: "平均回転数【改良】",
    dataIndex: "平均回転数【改良】",
    key: "4",
    unit: "rpm",
  },
  { title: "平均注入圧力", dataIndex: "平均注入圧力", key: "5", unit: "MPa" },
  {
    title: "水注入量【貫入】",
    dataIndex: "水注入量【貫入】",
    key: "6",
    unit: "L",
  },
  { title: "スラリー注入量", dataIndex: "スラリー注入量", key: "7", unit: "L" },
  { title: "平均空気量", dataIndex: "平均空気量", key: "8", unit: "N㎥/min" },
  {
    title: "発生土改質液注入量",
    dataIndex: "発生土改質液注入量",
    key: "9",
    unit: "L",
  },
];

interface TableRow {
  key: string;
  label: string;
  [key: string]: any;
}

export default function Taba({ checkedKeys, onCheckedChange }: TabaProps) {
  const options = allColumns.map((col) => ({
    label: col.title,
    value: col.key,
  }));
  const visibleColumns = allColumns.filter((col) =>
    checkedKeys.includes(col.key)
  );
  const columns = [
    {
      title: "項目",
      dataIndex: "label",
      key: "label",
      render: (text: string, record: TableRow) =>
        record.key === "unit" ? <b>{text}</b> : text,
    },
    ...visibleColumns.map((col) => ({
      title: col.title,
      dataIndex: col.dataIndex,
      key: col.key,
      render: (text: string, record: TableRow) =>
        record.key === "unit" ? <b>{text}</b> : text,
    })),
  ];
  const tableData: TableRow[] = [
    {
      key: "unit",
      label: "単位",
      ...Object.fromEntries(
        visibleColumns.map((col) => [col.dataIndex, col.unit])
      ),
    },
    {
      key: "empty",
      label: "空打",
      ...Object.fromEntries(visibleColumns.map((col) => [col.dataIndex, ""])),
    },
  ];
  return (
    <>
      <Checkbox.Group
        value={checkedKeys}
        options={options}
        onChange={onCheckedChange}
        style={{ marginBottom: 16 }}
      />
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={false}
        bordered
      />
    </>
  );
}
