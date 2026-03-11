import { Table } from "antd";

export default function WorkerAssignments({ assignments = [] }) {
  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "product_code",
    },
    {
      title: "Công đoạn",
      dataIndex: "stage_name",
    },
    {
      title: "Đã giao",
      dataIndex: "assigned_quantity",
    },
    {
      title: "Đã làm",
      dataIndex: "done_quantity",
    },
  ];

  const data = assignments.map((a) => ({
    key: a.id,
    ...a,
  }));

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
    />
  );
}