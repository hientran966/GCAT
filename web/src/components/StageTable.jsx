import { useMemo, useState } from "react";
import { Button, Table, Popconfirm } from "antd";

const PAGE_SIZE = 6;

function StageTable({ stages, onAssign, onEdit, onDelete }) {
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
      width: 120,
      align: "center",
    },
    {
      title: "Hình ảnh",
      dataIndex: "image_url",
      key: "image_url",
      width: 120,
      align: "center",
      render: (url) => {
        if (!url) return "-";

        const imagePath = `http://localhost:3000/${url.replace(/\\/g, "/")}`;

        return (
          <img
            src={imagePath}
            alt="stage"
            style={{
              width: 32,
              height: 32,
              objectFit: "cover",
              borderRadius: 6,
            }}
          />
        );
      },
    },
    {
      title: "Tên công đoạn",
      dataIndex: "stage_name",
      key: "stage_name",
      ellipsis: true,
    },
    {
      title: "Số lượng",
      key: "stage_quantity",
      align: "center",
      render: (_, record) => (
        <span>
          {record.assigned_quantity || 0}/{record.stage_quantity}
        </span>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      align: "center",
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button type="link" onClick={() => onAssign(record)}>
            Phân công
          </Button>

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