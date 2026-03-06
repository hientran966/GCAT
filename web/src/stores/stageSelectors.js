export const selectStageById = (state, id) =>
  state.stage.stages.find(p => p.id === id);

export const selectFilteredStages = (state, productId) => {
  const { stages, searchTerm } = state.stage;

  let filtered = stages;

  if (productId) {
    filtered = filtered.filter((s) => s.product_id === productId);
  }

  if (searchTerm) {
    const lower = searchTerm.toLowerCase();

    filtered = filtered.filter((s) =>
      s.name?.toLowerCase().includes(lower)
    );
  }

  return filtered;
};