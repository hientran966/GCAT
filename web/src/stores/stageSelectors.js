export const selectStageById = (state, id) =>
  state.stage.stages.find(p => p.id === id);

export const selectFilteredStages = (state) => {
  const { stages, searchTerm } = state.stage;

  if (!searchTerm) return stages;

  const lower = searchTerm.toLowerCase();

  return stages.filter((p) =>
    p.name?.toLowerCase().includes(lower)
  );
};