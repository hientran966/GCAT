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
  account,
  onAdd,
}) {
  const dispatch = useDispatch();

  const isDetail = view === "detail";

  /* =====================
     BREADCRUMB
  ===================== */
  const breadcrumbItems = useMemo(() => {
    if (page === "product") {
      return [{ title: "Danh sách hàng" }];
    }

    if (page === "stage") {
      return [{ title: "Danh sách công đoạn" }];
    }

    if (page === "assign") {
      return [{ title: "Danh sách phân công" }];
    }

    if (page === "worker") {
      const items = [{ title: "Nhân công" }];

      if (view === "detail" && account?.name) {
        items.push({ title: account.name });
      }

      return items;
    }

    return [{ title: "Danh sách" }];
  }, [page, view, account]);

  return (
    <div className="header">
      
      {/* ===== BREADCRUMB ===== */}
      <div style={{ marginBottom: isDetail ? 0 : 12 }}>
        <Breadcrumb
          items={breadcrumbItems}
          style={{ fontSize: 18, fontWeight: 500 }}
        />
      </div>

      {/* ===== TOOLBAR ===== */}
      {!isDetail && (
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
      )}

    </div>
  );
}