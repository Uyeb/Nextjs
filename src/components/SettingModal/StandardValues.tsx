"use client";
import React from "react";
import { Checkbox, Table } from "antd";
import data from "./db";

interface StandardValuesProps {
  checkedKeys: string[];
  onCheckedChange: (keys: string[]) => void;
}

const allColumns = [
  { title: "貫入時間", dataIndex: "貫入時間", key: "1", unit: "min/m" },
  { title: "改良時間", dataIndex: "改良時間", key: "2", unit: "min/m" },
  {
    title: "平均回転数【貫入】",
    dataIndex: "平均回転数貫入",
    key: "3",
    unit: "rpm",
  },
  {
    title: "平均回転数【改良】",
    dataIndex: "平均回転数改良",
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

export default function StandardValues({
  checkedKeys,
  onCheckedChange,
}: StandardValuesProps) {
  const visibleColumns = allColumns.filter((col) =>
    checkedKeys.includes(col.key)
  );

  const generateRow = (index: number): TableRow => {
    const base = data["基準値"] as Record<
      string,
      Record<number, { "1": string; "2": string }> | null
    >;

    return {
      key: `row${index}`,
      label: index === 0 ? "空打" : `${index}`,
      ...Object.fromEntries(
        visibleColumns.map((col) => {
          const columnData = base[col.dataIndex];
          const item = columnData?.[index];
          const val = item?.["1"] || "";
          const suffix = item?.["2"] || "";

          return [
            col.dataIndex,
            <div
              key={col.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                whiteSpace: "nowrap",
              }}
            >
              <input
                defaultValue={val}
                disabled={col.key === "7"}
                style={{
                  width: "100%",
                  padding: "4px 8px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  marginRight: 4,
                  backgroundColor: col.key === "7" ? "#f5f5f5" : undefined,
                  color: col.key === "7" ? "rgba(0, 0, 0, 0.25)" : undefined,
                }}
              />
              <span>{suffix}</span>
            </div>,
          ];
        })
      ),
    };
  };

  const tableData: TableRow[] = [
    {
      key: "unit",
      label: "単位",
      ...Object.fromEntries(
        visibleColumns.map((col) => [col.dataIndex, col.unit])
      ),
    },
    generateRow(0),
    generateRow(1),
  ];

  const columns = [
    {
      title: "項目",
      dataIndex: "label",
      key: "label",
      align: "center" as const,
      render: (text: string, record: TableRow) =>
        record.key === "unit" ? (
          <b style={{ whiteSpace: "nowrap" }}>{text}</b>
        ) : (
          <span style={{ whiteSpace: "nowrap" }}>{text}</span>
        ),
    },
    ...visibleColumns.map((col) => ({
      title: col.title,
      dataIndex: col.dataIndex,
      key: col.key,
      align: "center" as const,
      render: (text: any, record: TableRow) =>
        record.key === "unit" ? <b>{text}</b> : text,
    })),
  ];

  return (
    <>
      <Checkbox.Group
        value={checkedKeys}
        options={allColumns.map((col) => ({
          label: col.title,
          value: col.key,
          disabled: ["6", "8", "9"].includes(col.key),
        }))}
        onChange={(val) => onCheckedChange(val as string[])}
        style={{ marginBottom: 16 }}
      />
      <div style={{ overflowX: "auto" }}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          bordered
        />
      </div>
    </>
  );
}
