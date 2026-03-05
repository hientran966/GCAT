import { useMemo, useState } from "react";
import { Button, Table } from "antd";

const PAGE_SIZE = 7;

function ProductTable({ products }) {
  const [currentPage, setCurrentPage] = useState(1);

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
        <div>
          <Button type="link" onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => onDelete(record)}>
            Xóa
          </Button>
        </div>
      ),
    }
  ];

  /* ================= HANDLERS ================= */
  const onEdit = (record) => {
    console.log("Edit", record);
  };
  const onDelete = (record) => {
    console.log("Delete", record);
  };

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
      rowClassName="product-row"
    />
  );
}

export default ProductTable;