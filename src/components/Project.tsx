import axiosClient from "../api/axiosClient";
import { useRef, useState, useEffect } from "react";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Input, Table, theme, Popconfirm, message } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import type { InputRef } from "antd";

interface Project {
  id: string;
  key: string;
  name: string;
  province: string;
  companyName: string;
}

interface SortItem {
  key?: string;
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
  const [filteredInfo, setFilteredInfo] = useState<FilterInfo>({});
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [searchTextColumn, setSearchTextColumn] = useState<FilterInfo>({});
  const searchInput = useRef<InputRef>(null);
  const [debounceText, setDebounceText] = useState<string>("");

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const loadProjects = async (
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
          ? [
              { key: "name", value: globalSearch },
              { key: "province", value: globalSearch },
              { key: "companyName", value: globalSearch },
            ]
          : filters,
        sort: sortList,
      };

      const { data } = await axiosClient.post(
        "/api/v1/Project/search",
        payload
      );
      console.log("Data BE trả về:", data);
      const listItem: Project[] = data.result.items.map((item: any) => ({
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
    } catch (error: any) {
      console.error("Error loading projects:", error);
    }
  };

  useEffect(() => {
    console.log("useEffect mount lần đầu");

    loadProjects();
  }, []);

  const handleTableChange = (
    paginationInfo: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorterInfo: SorterResult<Project> | SorterResult<Project>[]
  ) => {
    const page = paginationInfo.current || 1;
    const size = paginationInfo.pageSize || 20;
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

    const columnFilters = Object.entries(searchTextColumn)
      .filter(([_, val]) => val && val.length > 0)
      .map(([key, value]) => ({ key, value: value! }));

    loadProjects(searchText || "", page, size, newSorter, columnFilters);
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
    setSearchText(undefined);

    const filters = Object.entries(updatedSearch)
      .filter(([_, val]) => val && val.length > 0)
      .map(([key, value]) => ({ key, value: value! }));

    loadProjects("", 1, pagination.pageSize || 20, sorter, filters);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceText(searchText || "");
    }, 500);

    return () => clearTimeout(handler);
  }, [searchText]);

  useEffect(() => {
    if (searchText !== undefined) {
      setSearchTextColumn({});
      setFilteredInfo({});
      loadProjects(debounceText, 1, pagination.pageSize || 20, sorter, []);
    }
  }, [debounceText]);

  const getColumnSearchProps = (dataIndex: keyof Project) => ({
    filterDropdown: ({
      close,
      setSelectedKeys,
      selectedKeys,
    }: {
      close: () => void;
      setSelectedKeys: (selectedKeys: React.Key[]) => void;
      selectedKeys: React.Key[];
    }): React.ReactNode => {
      const currentSearchText = searchTextColumn[dataIndex] || "";

      return (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            ref={searchInput}
            placeholder={`Search ${dataIndex}`}
            value={(selectedKeys[0] as string) ?? currentSearchText}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() =>
              handleSearch(close, selectedKeys as string[], dataIndex as string)
            }
            style={{ marginBottom: 8, display: "block" }}
          />
        </div>
      );
    },

    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    filterDropdownProps: {
      onOpenChange: (open: boolean) => {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text: string) => text,
  });

  const handleDelete = async (record: Project) => {
    if (!record?.id) return message.error("Missing project ID to delete");

    try {
      await axiosClient.post(`/api/v1/Project/delete`, [record.id]);
      message.success("Deleted successfully!");
      loadProjects(
        searchText || "",
        pagination.current || 1,
        pagination.pageSize || 20,
        sorter,
        []
      );
    } catch (error: any) {
      console.error("Delete failed:", error);
    }
  };

  const columns: ColumnsType<Project> = [
    {
      title: "Project name",
      dataIndex: "name",
      key: "name",
      width: 300,
      ...getColumnSearchProps("name"),
      sorter: true,
      sortDirections: ["descend", "ascend"],
      filteredValue: filteredInfo.name ? [filteredInfo.name] : null,
    },
    {
      title: "Province",
      dataIndex: "province",
      key: "province",
      width: 300,
      ...getColumnSearchProps("province"),
      sorter: true,
      sortDirections: ["descend", "ascend"],
      filteredValue: filteredInfo.province ? [filteredInfo.province] : null,
    },
    {
      title: "Company",
      dataIndex: "companyName",
      key: "companyName",
      width: 300,
      ...getColumnSearchProps("companyName"),
      sorter: true,
      sortDirections: ["descend", "ascend"],
      filteredValue: filteredInfo.companyName
        ? [filteredInfo.companyName]
        : null,
    },
    {
      title: "",
      key: "actions",
      width: 300,
      render: (_text, record) => (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* <ProjectModal
            mode="edit"
            project={record}
            onProjectChanged={() =>
              loadProjects(
                searchText || "",
                pagination.current || 1,
                pagination.pageSize || 20,
                sorter,
                []
              )
            }
            buttonStyle={{ height: 36 }}
          /> */}
          <Popconfirm
            title="Are you sure to delete this project?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger style={{ height: 36, width: 150 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <h2
        style={{
          borderRadius: borderRadiusLG,
          backgroundColor: colorBgContainer,
          padding: 8,
          marginBottom: 10,
        }}
      >
        Project list
      </h2>

      <Input.Search
        placeholder="Search global..."
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
        scroll={{ x: "max-content" }}
      />
    </>
  );
}
