export const selectStageById = (state, id) =>
  state.stage.stages.find(p => p.id === id);

export const selectFilteredStages = (state ) => {
  const stages = state.stage?.stages || [];
  const searchTerm = state.stage?.searchTerm || "";

  let filtered = stages;

  if (searchTerm) {
    const lower = searchTerm.toLowerCase();

    filtered = filtered.filter((s) =>
      s.name?.toLowerCase().includes(lower)
    );
  }

  return filtered;
};