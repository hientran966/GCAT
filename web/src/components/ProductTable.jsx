import { useMemo, useState } from "react";
import { Button, Table, Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 6;

function ProductTable({ products, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  /* ================= DATA SOURCE ================= */
  const dataSource = useMemo(
    () =>
      products.map((p) => ({
        key: p.id,
        ...p,
      })),
    [products]
  );

  /* ================= COLUMNS ================= */
  const columns = [
    {
      title: "Mã hàng",
      dataIndex: "code",
      key: "code",
      ellipsis: true,
    },
    {
      title: "Tên hàng",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Số lượng",
      dataIndex: "total_quantity",
      key: "total_quantity",
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
            title="Xóa sản phẩm?"
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
    },
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
        onClick: () => {
          navigate("/stages", {
            state: { product: record },
          });
        },
      })}
      rowClassName="product-row"
    />
  );
}

export default ProductTable;