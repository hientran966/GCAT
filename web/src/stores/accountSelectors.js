export const selectAccountById = (state, id) =>
  state.account.accounts.find(p => p.id === id);

export const selectFilteredAccounts = (state ) => {
  const accounts = state.account?.accounts || [];
  const searchTerm = state.account?.searchTerm || "";

  let filtered = accounts;

  if (searchTerm) {
    const lower = searchTerm.toLowerCase();

    filtered = filtered.filter((s) =>
      s.name?.toLowerCase().includes(lower)
    );
  }

  return filtered;
};