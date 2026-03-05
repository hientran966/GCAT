import { useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  Button,
  Input,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import {
  setSearch as setProductSearch,
} from "@/stores/productSlice";

import "@/assets/css/Header.css";

export default function Header({
  page,
  view,
  onAdd,
}) {
  const dispatch = useDispatch();

  /* =====================
     STATE
  ===================== */

  /* =====================
     TITLE
  ===================== */
  const pageTitle = useMemo(() => {
    if (view === "1") return 1;
    if (page === "2") return 2;
    return page === "project" ? "Danh sách Project" : "Danh sách";
  }, [page, view]);

  /* =====================
     RENDER
  ===================== */
  return (
    <div style={{ padding: "16px 24px", background: "#fff" }}>
      {/* ===== TITLE ===== */}
      <div style={{ display: "flex", alignItems: "center", height: 40 }}>
        <h3 style={{ margin: 0, marginLeft: 16, color: "black" }}>{pageTitle}</h3>
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
              const value = e.target.value;
              dispatch(setProductSearch(value));
            }}
            style={{ width: 180, marginRight: 8 }}
            allowClear
          />
        </div>
      </div>
    </div>
  );
}