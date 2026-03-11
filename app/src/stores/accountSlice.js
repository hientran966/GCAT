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

// fetchAccountDetail
export const fetchAccountDetail = createAsyncThunk(
  "account/fetchAccountDetail",
  async (id, { rejectWithValue }) => {
    try {
      const account = await AccountService.getAccountById(id);
      return account;
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
    accountDetail: null,
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

    clearAccountDetail(state) {
      state.accountDetail = null;
    }
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
      })

      /* fetchAccountDetail */
      .addCase(fetchAccountDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccountDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.accountDetail = action.payload;
      })
      .addCase(fetchAccountDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

/* =====================
   EXPORT
===================== */

export const {
  addAccount,
  setSearch,
  clearAccountDetail
} = accountSlice.actions;

export default accountSlice.reducer;
