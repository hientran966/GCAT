import { useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  Breadcrumb,
  Button,
  Input,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { setSearch as setProductSearch } from "@/stores/productSlice";

import "@/assets/css/Header.css";

export default function Header({
  page,
  view,
  product,
  account,
  onAdd,
}) {
  const dispatch = useDispatch();

  /* =====================
     BREADCRUMB
  ===================== */
  const breadcrumbItems = useMemo(() => {
    if (page === "product") {
      const items = [
        { title: "Danh sách hàng" },
      ];

      return items;
    }

    if (page === "stage" && product?.name) {
      const items = [
        { title: product.name }
      ];
      items.push({ title: "Danh sách công đoạn" });

      return items;
    }

    if (page === "worker") {
      const items = [
        { title: "Nhân công" },
      ];

      if (view === "detail" && account?.name) {
        items.push({ title: account.name });
      }

      return items;
    }

    return [{ title: "Danh sách" }];
  }, [page, view, product, account]);

  return (
    <div style={{ padding: "16px 24px", background: "#fff" }}>
      
      {/* ===== BREADCRUMB ===== */}
      <div style={{ marginBottom: 12 }}>
        <Breadcrumb items={breadcrumbItems} style={{ fontSize: 18, fontWeight: 500 }} />
      </div>

      {/* ===== TOOLBAR ===== */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        
        {/* LEFT */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            Thêm mới
          </Button>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            onChange={(e) => {
              dispatch(setProductSearch(e.target.value));
            }}
            style={{ width: 180, marginRight: 8 }}
            allowClear
          />
        </div>

      </div>
    </div>
  );
}