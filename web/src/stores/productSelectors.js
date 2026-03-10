export const selectProductById = (state, id) =>
  state.product.products.find(p => p.id === id);

export const selectFilteredProducts = (state) => {
  const products = state.product?.products || [];
  const searchTerm = state.product?.searchTerm || "";

  if (!searchTerm) return products;

  const lower = searchTerm.toLowerCase();

  return products.filter((p) =>
    p.code?.toLowerCase().includes(lower) ||
    p.name?.toLowerCase().includes(lower)
  );
};