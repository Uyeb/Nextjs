import React, { useCallback, useEffect, useState } from "react";
import { Table, Input, Button } from "antd";
import { CheckCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import axiosClient from "@/api/axiosClient";
import { useRouter } from "next/router";
import AreaModal from "@/components/AreaModal";
import { message, Popconfirm } from "antd";

interface ProjectArea {
  id: string;
  key: string;
  name: string;
  updatedOn: string;
  fileVersionDtos: {
    objectKey: string;
  };
  totalList: number;
  totalPile: number;
}

interface SortItem {
  key: string;
  sort: number;
}

export default function ProjectAreas() {
  const [items, setItems] = useState<ProjectArea[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
  });
  const [sorter, setSorter] = useState<SortItem[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [debounceSearchText, setDebounceSearchText] = useState<string>("");
  const router = useRouter();
  const { projectId } = router.query;

  // Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearchText(searchText);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchText]);

  const loadProjectAreas = useCallback(
    async (
      globalSearch = "",
      page = 1,
      size = 20,
      sortList: SortItem[] = sorter
    ) => {
      try {
        const payload: any = {
          pageNumber: page,
          pageSize: size,
        };

        if (globalSearch) {
          payload.search = globalSearch;
        }

        if (sortList.length > 0) {
          payload.sorts = sortList;
        }

        const { data } = await axiosClient.post(
          `/api/v1/ProjectArea/search?id=${projectId}`,
          payload
        );

        const listItem = data.result.items.map((item: any) => ({
          key: item.id,
          id: item.id,
          name: item.name,
          updatedOn: item.updatedOn,
          fileVersionDtos: item.fileVersionDtos,
          totalList: item.totalList,
          totalPile: item.totalPile,
        }));

        setItems(listItem);
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize: size,
          total: data.result.totalCount,
        }));
      } catch (error) {
        console.error("Error loading project areas:", error);
      }
    },
    [sorter, projectId]
  );

  useEffect(() => {
    if (projectId) {
      loadProjectAreas(debounceSearchText, 1, pagination.pageSize!, sorter);
    }
  }, [projectId, debounceSearchText]);

  const handleTableChange = (
    { current = 1, pageSize = 20 }: TablePaginationConfig,
    _: any,
    sorterInfo: SorterResult<ProjectArea> | SorterResult<ProjectArea>[]
  ) => {
    let newSorter: SortItem[] = [];

    if (Array.isArray(sorterInfo)) {
      newSorter = sorterInfo.map((s) => ({
        key: s.field as string,
        sort: s.order === "ascend" ? 1 : s.order === "descend" ? 2 : 0,
      }));
    } else if (sorterInfo.field) {
      newSorter = [
        {
          key: sorterInfo.field as string,
          sort:
            sorterInfo.order === "ascend"
              ? 1
              : sorterInfo.order === "descend"
              ? 2
              : 0,
        },
      ];
    }
    setSorter(newSorter);
    loadProjectAreas(debounceSearchText, current, pageSize, newSorter);
  };

  // Xóa area
  const handleDelete = async (record: ProjectArea) => {
    if (!record?.id) return message.error("Missing area ID to delete");
    try {
      await axiosClient.post(
        "/api/v1/ProjectArea/delete",
        JSON.stringify(record.id),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      message.success("Deleted successfully!");
      loadProjectAreas();
    } catch (error) {
      console.error("Delete failed:", error);
      message.error("Delete failed!");
    }
  };

  const columns: ColumnsType<ProjectArea> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 300,
      sorter: true,
    },
    {
      title: "Last Update",
      dataIndex: "updatedOn",
      key: "updatedOn",
      width: 300,
      sorter: true,
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Model Status",
      key: "model",
      width: 300,
      render: (_, record) => {
        const objectKey = record.fileVersionDtos?.objectKey;

        if (!objectKey) {
          return (
            <Input
              disabled
              value="Not yet created"
              style={{
                color: "#bbb",
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "32px",
              }}
            />
          );
        }

        return (
          <div
            style={{
              border: "1px solid #52c41a",
              backgroundColor: "#f6ffed",
              borderRadius: 6,
              padding: "6px 12px",
              color: "#52c41a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <CheckCircleOutlined />
            <span>Completed</span>
          </div>
        );
      },
    },
    {
      title: "List file",
      dataIndex: "totalList",
      key: "totalList",
      width: 100,
    },
    {
      title: "Pile file",
      dataIndex: "totalPile",
      key: "totalPile",
      width: 100,
      sorter: true,
    },
    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <AreaModal
            mode="edit"
            projectId={projectId as string}
            area={record}
            onAreaChanged={loadProjectAreas}
            buttonStyle={{ padding: 0 }}
          />
          <Popconfirm
            title="Are you sure to delete this area?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} style={{ padding: 0 }} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "1rem 0",
        }}
      >
        <h2>List Area</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <AreaModal
            mode="create"
            projectId={projectId as string}
            onAreaChanged={loadProjectAreas}
            buttonStyle={{ height: 36 }}
          />
        </div>
      </div>

      <Input
        placeholder="Search"
        allowClear
        onChange={(e) => setSearchText(e.target.value)}
        value={searchText}
        style={{ maxWidth: 300, marginBottom: 20 }}
      />

      <Table
        columns={columns}
        dataSource={items}
        pagination={pagination}
        onChange={handleTableChange}
        rowKey="id"
        scroll={{ x: 600, y: 200 }}
      />
    </>
  );
}
