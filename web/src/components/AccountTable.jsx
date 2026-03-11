import { useMemo, useState } from "react";
import { Button, Table, Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 6;

function AccountTable({ accounts, onEdit, onDelete }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  /* ================= DATA SOURCE ================= */
  const dataSource = useMemo(
    () =>
      accounts.map((p) => ({
        key: p.id,
        ...p,
      })),
    [accounts]
  );

  /* ================= COLUMNS ================= */
  const columns = [
    {
      title: "Tên công nhân",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      ellipsis: true,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
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
            title="Xóa công nhân?"
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
        onClick: () => {
          navigate(`/workers/${record.id}`);
        },
      })}
      rowClassName="account-row"
    />
  );
}

export default AccountTable;