import axiosClient from "../api/axiosClient";
import { useRef, useState, useEffect, useCallback } from "react";
import { SearchOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Input, Table, Popconfirm, message } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import type { InputRef } from "antd";
import ProjectModal from "./ProjectModal";

interface Project {
  id: string;
  key: string;
  name: string;
  province: string;
  companyName: string;
}

interface SortItem {
  key: string;
  sort: number;
}

type FilterInfo = Record<string, string | undefined>;

export default function Projects() {
  const [items, setItems] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
  });
  const [sorter, setSorter] = useState<SortItem[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [searchTextColumn, setSearchTextColumn] = useState<FilterInfo>({});
  const [debounceText, setDebounceText] = useState<string>("");
  const searchInput = useRef<InputRef>(null);

  const loadProjects = useCallback(
    async (
      globalSearch = "",
      page = 1,
      size = 20,
      sortList = sorter,
      filters: { key: string; value: string }[] = []
    ) => {
      try {
        const payload = {
          pageNumber: page,
          pageSize: size,
          search: globalSearch
            ? ["name", "province", "companyName"].map((key) => ({
                key,
                value: globalSearch,
              }))
            : filters,
          sorts: sortList,
        };

        const { data } = await axiosClient.post(
          "/api/v1/Project/search",
          payload
        );
        const listItem = data.result.items.map((item: any) => ({
          key: item.id,
          ...item,
        }));

        setItems(listItem);
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize: size,
          total: data.result.totalCount,
        }));
      } catch (error) {
        console.error("Error loading projects:", error);
      }
    },
    [sorter]
  );

  useEffect(() => {
    loadProjects();
  }, []);

  const refreshProjects = () => {
    const filters = Object.entries(searchTextColumn)
      .filter(([_, val]) => val)
      .map(([key, value]) => ({ key, value: value! }));

    loadProjects(
      searchText || "",
      pagination.current!,
      pagination.pageSize!,
      sorter,
      filters
    );
  };

  // Xử lý phân trang + sort
  const handleTableChange = (
    { current = 1, pageSize = 20 }: TablePaginationConfig,
    _: Record<string, any>,
    sorterInfo: SorterResult<Project> | SorterResult<Project>[]
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
    loadProjects(searchText || "", current, pageSize, newSorter);
  };

  const handleSearch = (
    close: () => void,
    selectedKeys: string[],
    dataIndex: string
  ) => {
    close();
    const value = selectedKeys[0] || "";
    const updatedSearch = { ...searchTextColumn, [dataIndex]: value };
    setSearchTextColumn(updatedSearch);
    setSearchText("");

    const filters = Object.entries(updatedSearch)
      .filter(([_, val]) => val)
      .map(([key, value]) => ({ key, value: value! }));

    loadProjects("", 1, pagination.pageSize!, sorter, filters);
  };

  useEffect(() => {
    const handler = setTimeout(() => setDebounceText(searchText), 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  useEffect(() => {
    if (searchText) {
      setSearchTextColumn({});
      loadProjects(debounceText, 1, pagination.pageSize!, sorter);
    }
  }, [debounceText]);

  const getColumnSearchProps = (dataIndex: keyof Project) => ({
    filterDropdown: ({ close, setSelectedKeys, selectedKeys }: any) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={
            (selectedKeys[0] as string) ?? (searchTextColumn[dataIndex] || "")
          }
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(close, selectedKeys as string[], dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    filterDropdownProps: {
      onOpenChange: (open: boolean) => {
        if (open) setTimeout(() => searchInput.current?.select(), 100);
      },
    },
  });

  // Xóa project
  const handleDelete = async (record: Project) => {
    if (!record?.id) return message.error("Missing project ID to delete");
    try {
      await axiosClient.post(`/api/v1/Project/delete`, [record.id]);
      message.success("Deleted successfully!");
      refreshProjects();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const resetReload = () => {
    const defaultPagination = { current: 1, pageSize: 20 };

    setPagination(defaultPagination);  
    setSorter([]);                      
    setSearchText('');               
    setSearchTextColumn({});           

    loadProjects("", 1, 20, [], []); 
  };

  const columns: ColumnsType<Project> = [
    {
      title: "Project name",
      dataIndex: "name",
      key: "name",
      width: 300,
      ...getColumnSearchProps("name"),
      sorter: true,
    },
    {
      title: "Province",
      dataIndex: "province",
      key: "province",
      width: 300,
      ...getColumnSearchProps("province"),
      sorter: true,
    },
    {
      title: "Company",
      dataIndex: "companyName",
      key: "companyName",
      width: 300,
      ...getColumnSearchProps("companyName"),
      sorter: true,
    },
    {
      title: "",
      key: "actions",
      width: 300,
      render: (_text, record) => (
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <ProjectModal
            mode="edit"
            project={record}
            onProjectChanged={refreshProjects}
            buttonStyle={{ height: 36 }}
          />
          <Popconfirm
            title="Are you sure to delete this project?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>
              <DeleteOutlined />
            </Button>
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
      <h2 style={{ margin: 0 }}>List Project</h2>
      <div style={{ display: "flex", gap: 8 }}>
        <Button onClick={resetReload} style={{ height: 36, width: 42 }}>
          <ReloadOutlined />
        </Button>

        <ProjectModal
          mode="create"
          onProjectChanged={refreshProjects}
          buttonStyle={{ height: 36, width: 130 }}
        />
      </div>
    </div>

      <Input.Search
        placeholder="Search"
        allowClear
        enterButton
        style={{ maxWidth: 400, marginBottom: 20 }}
        onChange={(e) => setSearchText(e.target.value)}
        onSearch={(val) => setSearchText(val)}
        value={searchText}
      />

      <Table
        columns={columns}
        dataSource={items}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 900, y: 200 }}
      />
    </>
  );
}
