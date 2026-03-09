export const selectAssignById = (state, id) =>
  state.assign.assigns.find(p => p.id === id);

export const selectFilteredAssigns = (state) => {
  const { assigns, searchTerm } = state.assign;

  let filtered = assigns;

  if (searchTerm) {
    const lower = searchTerm.toLowerCase();

    filtered = filtered.filter((a) =>
      a.name?.toLowerCase().includes(lower)
    );
  }

  return filtered;
};