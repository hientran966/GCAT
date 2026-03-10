import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AccountService from "@/services/Account.service";

/* =====================
   ASYNC THUNKS
===================== */

// fetchAccounts
export const fetchAccounts = createAsyncThunk(
  "account/fetchAccounts",
  async (__, { rejectWithValue }) => {
    try {
      const accounts = await AccountService.getAllAccount();
      return accounts;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// updateAccount
export const updateAccount = createAsyncThunk(
  "account/updateAccount",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await AccountService.updateAccount(payload.id, payload);
      dispatch(fetchAccounts());
      return payload;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* =====================
   SLICE
===================== */

const accountSlice = createSlice({
  name: "account",
  initialState: {
    accounts: [],
    loading: false,
    searchTerm: "",
    error: null,
  },

  reducers: {
    addAccount(state, action) {
      state.accounts.push(action.payload);
    },

    setSearch(state, action) {
      state.searchTerm = action.payload.toLowerCase();
    },
  },

  extraReducers: (builder) => {
    builder
      /* fetchAccounts */
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload.map(p => ({ ...p }));
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* =====================
   EXPORT
===================== */

export const {
  addaccount,
  setSearch,
} = accountSlice.actions;

export default accountSlice.reducer;
