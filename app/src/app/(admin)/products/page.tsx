"use client";

import { Table } from "antd";
import { useEffect, useState } from "react";
import { getProducts } from "@/services/product.service";

export default function ProductsPage() {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const res = await getProducts();
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Table
      dataSource={data}
      rowKey="id"
      columns={[
        { title: "Code", dataIndex: "code" },
        { title: "Name", dataIndex: "name" },
        { title: "Supplier", dataIndex: "supplier" },
      ]}
    />
  );
}