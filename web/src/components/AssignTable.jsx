import { useMemo, useState } from "react";
import { Button, Table, Popconfirm } from "antd";

const PAGE_SIZE = 6;

function AssignTable({ assigns, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);

  /* ================= DATA SOURCE ================= */
  const dataSource = useMemo(
    () =>
      assigns.map((p) => ({
        key: p.id,
        ...p,
      })),
    [assigns]
  );

  /* ================= COLUMNS ================= */
  const columns = [
    {
      title: "Mã hàng",
      dataIndex: "product_code",
      key: "product_code",
      ellipsis: true,
      width: 120,
      align: "center",
    },
    {
      title: "Tên công đoạn",
      dataIndex: "stage_name",
      key: "stage_name",
      ellipsis: true,
    },
    {
      title: "Tên nhân công",
      dataIndex: "worker_name",
      key: "worker_name",
      ellipsis: true,
    },
    {
      title: "Số lượng",
      dataIndex: "assigned_quantity",
      key: "assigned_quantity",
      align: "center",
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button type="link" onClick={() => onEdit(record)}>
            Sửa
          </Button>

          <Popconfirm
            title="Xóa phân công?"
            description="Bạn chắc chắn muốn xóa?"
            onConfirm={() => onDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    }
  ];

  /* ================= RENDER ================= */
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={{
        current: currentPage,
        pageSize: PAGE_SIZE,
        total: dataSource.length,
        onChange: setCurrentPage,
        showSizeChanger: false,
      }}
      onRow={(record) => ({
        onClick: () => {console.log(record)},
      })}
      rowClassName="stage-row"
    />
  );
}

export default AssignTable;