"use client";

import {
  Button,
  Card,
  Empty,
  Image,
  InputNumber,
  Pagination,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createMyAssignment, getUserAssignments } from "@/services/assignment.service";
import { resolveFileUrl } from "@/services/api";
import { getOpenOperations } from "@/services/operation.service";
import { getProducts } from "@/services/product.service";
import type { Assignment, Id, Operation, Product } from "@/services/types";

const PAGE_SIZE = 12;

type OpenFilters = {
  product_id?: Id;
  min_price?: number;
  max_price?: number;
  page: number;
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    return response?.data?.message;
  }

  return undefined;
};

export default function OpenPage() {
  const searchParams = useSearchParams();
  const keyword = (searchParams.get("q") ?? "").trim();

  const [data, setData] = useState<Operation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<OpenFilters>({ page: 1 });
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  const assignedOperationIds = useMemo(
    () => new Set(assignments.map((item) => item.operation_id)),
    [assignments],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const [operationsRes, assignmentsRes] = await Promise.all([
        getOpenOperations({
          page: filters.page,
          limit: PAGE_SIZE,
          product_id: filters.product_id,
          keyword: keyword || undefined,
          min_price: filters.min_price,
          max_price: filters.max_price,
        }),
        getUserAssignments(),
      ]);

      setData(operationsRes.data);
      setTotal(operationsRes.total);
      setAssignments(assignmentsRes);
    } finally {
      setLoading(false);
    }
  }, [
    filters.max_price,
    filters.min_price,
    filters.page,
    filters.product_id,
    keyword,
  ]);

  const fetchProducts = useCallback(async () => {
    const res = await getProducts({ limit: 100 });
    setProducts(res.data);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setFilters((current) => ({ ...current, page: 1 }));
  }, [keyword]);

  const updateFilters = (next: Partial<OpenFilters>) => {
    setFilters((current) => ({ ...current, ...next, page: 1 }));
  };

  const handleClaim = async (operation: Operation) => {
    setClaimingId(operation.id);

    try {
      await createMyAssignment(operation.id);
      message.success("Đã nhận công đoạn");
      await fetchData();
    } catch (error) {
      message.error(getErrorMessage(error) ?? "Không thể nhận công đoạn");
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card size="small">
        <Space wrap size={12}>
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Lọc sản phẩm"
            style={{ width: 260 }}
            value={filters.product_id}
            onChange={(value) => updateFilters({ product_id: value })}
            options={products.map((product) => ({
              value: product.id,
              label: `${product.code} - ${product.name}`,
            }))}
          />
          <InputNumber
            min={0}
            placeholder="Giá từ"
            style={{ width: 140 }}
            value={filters.min_price}
            formatter={(value) =>
              value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""
            }
            parser={(value) => Number((value ?? "").replace(/\./g, ""))}
            onChange={(value) =>
              updateFilters({ min_price: value === null ? undefined : Number(value) })
            }
          />
          <InputNumber
            min={0}
            placeholder="Giá đến"
            style={{ width: 140 }}
            value={filters.max_price}
            formatter={(value) =>
              value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""
            }
            parser={(value) => Number((value ?? "").replace(/\./g, ""))}
            onChange={(value) =>
              updateFilters({ max_price: value === null ? undefined : Number(value) })
            }
          />
          <Button
            onClick={() => setFilters({ page: 1 })}
            disabled={
              !filters.product_id &&
              filters.min_price === undefined &&
              filters.max_price === undefined
            }
          >
            Xóa lọc
          </Button>
        </Space>
      </Card>

      <Spin spinning={loading}>
        {data.length === 0 ? (
          <Card>
            <Empty description="Chưa có công đoạn phù hợp" />
          </Card>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {data.map((item) => {
              const isAssigned = assignedOperationIds.has(item.id);

              return (
                <Card
                  key={item.id}
                  size="small"
                  cover={
                    item.image ? (
                      <Image
                        src={resolveFileUrl(item.image)}
                        alt={item.name}
                        height={160}
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          height: 160,
                          background: "#f0f2f5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography.Text type="secondary">
                          Chưa có ảnh
                        </Typography.Text>
                      </div>
                    )
                  }
                  actions={[
                    <Button
                      key="claim"
                      type="primary"
                      disabled={isAssigned}
                      loading={claimingId === item.id}
                      onClick={() => handleClaim(item)}
                    >
                      {isAssigned ? "Đã nhận" : "Nhận công đoạn"}
                    </Button>,
                  ]}
                >
                  <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Space
                      wrap
                      style={{ justifyContent: "space-between", width: "100%" }}
                    >
                      <Tag color="blue">{item.product_code ?? "N/A"}</Tag>
                      <Typography.Text strong>
                        {Number(item.price ?? 0).toLocaleString("vi-VN")}
                      </Typography.Text>
                    </Space>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {item.name}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      {item.product_name ?? item.product_code ?? "Sản phẩm không xác định"}
                    </Typography.Text>
                  </Space>
                </Card>
              );
            })}
          </div>
        )}
      </Spin>

      {total > PAGE_SIZE && (
        <Pagination
          current={filters.page}
          pageSize={PAGE_SIZE}
          total={total}
          showSizeChanger={false}
          align="center"
          onChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      )}
    </Space>
  );
}
