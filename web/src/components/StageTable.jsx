import { useMemo, useState } from "react";
import { Button, Table, Popconfirm } from "antd";

const PAGE_SIZE = 6;

function StageTable({ stages, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);

  /* ================= DATA SOURCE ================= */
  const dataSource = useMemo(
    () =>
      stages.map((p) => ({
        key: p.id,
        ...p,
      })),
    [stages]
  );

  /* ================= COLUMNS ================= */
  const columns = [
    {
      title: "Mã hàng",
      dataIndex: "product_code",
      key: "product_code",
      ellipsis: true,
    },
    {
      title: "Tên công đoạn",
      dataIndex: "stage_name",
      key: "stage_name",
      ellipsis: true,
    },
    {
      title: "Số lượng",
      dataIndex: "stage_quantity",
      key: "stage_quantity",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button type="link" onClick={() => onEdit(record)}>
            Sửa
          </Button>

          <Popconfirm
            title="Xóa công đoạn?"
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

export default StageTable;