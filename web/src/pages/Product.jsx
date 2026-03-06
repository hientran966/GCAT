import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";

import Header from "@/components/Header";
import ProductTable from "@/components/ProductTable";
import ProductForm from "@/components/ProductForm";

import ProductService from "@/services/Product.service";

import { fetchProducts } from "@/stores/productSlice";
import { selectFilteredProducts } from "@/stores/productSelectors";

import "@/assets/css/Products.css";

function ProductsView() {
  const dispatch = useDispatch();

  /* =======================
     STORE
  ======================= */
  const products = useSelector(selectFilteredProducts);
  const loading = useSelector((state) => state.product.loading);

  /* =======================
     UI STATE
  ======================= */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  /* =======================
     HANDLERS
  ======================= */
  const onAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const onEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const onDelete = async (product) => {
    await ProductService.deleteProduct(product.id);
    message.success("Xóa thành công");
    dispatch(fetchProducts());
  };

  const onProductAdded = () => {
    dispatch(fetchProducts());
    setIsFormOpen(false);
  };

  /* =======================
     LIFECYCLE
  ======================= */
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  /* =======================
     RENDER
  ======================= */
  return (
    <>
      <Header page="product" onAdd={onAdd} />

      <ProductTable
        className="product-table"
        loading={loading}
        products={products}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <ProductForm
        open={isFormOpen}
        product={editingProduct}
        onClose={() => setIsFormOpen(false)}
        onProductAdded={onProductAdded}
      />
    </>
  );
}

export default ProductsView;
