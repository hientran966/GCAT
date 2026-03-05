export const selectProductById = (state, id) =>
  state.product.products.find(p => p.id === id);

export const selectFilteredProducts = (state) => {
  const { products, searchTerm } = state.product;

  if (!searchTerm) return products;

  const lower = searchTerm.toLowerCase();

  return products.filter((p) =>
    p.name?.toLowerCase().includes(lower)
  );
};