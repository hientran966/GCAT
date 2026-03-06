import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Header from "@/components/Header";
import ProductTable from "@/components/ProductTable";
import ProductForm from "@/components/ProductForm";

import { fetchProducts, updateProduct } from "@/stores/productSlice";
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

  /* =======================
     HANDLERS
  ======================= */
  const onAdd = () => setIsFormOpen(true);

  const onUpdateProduct = (payload) => {
    dispatch(updateProduct(payload));
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
        onUpdateProduct={onUpdateProduct}
      />

      <ProductForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onProductAdded={onProductAdded}
      />
    </>
  );
}

export default ProductsView;
