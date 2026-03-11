import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AssignService from "@/services/Assign.service";

/* =====================
   ASYNC THUNKS
===================== */

// fetchAssigns
export const fetchAssigns = createAsyncThunk(
  "assign/fetchAssigns",
  async (__, { rejectWithValue }) => {
    try {
      const assigns = await AssignService.getAllAssign();
      return assigns;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// updateAssign
export const updateAssign = createAsyncThunk(
  "assign/updateAssign",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await AssignService.updateAssign(payload.id, payload);
      dispatch(fetchAssigns());
      return payload;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* =====================
   SLICE
===================== */

const assignSlice = createSlice({
  name: "assign",
  initialState: {
    assigns: [],
    loading: false,
    searchTerm: "",
    error: null,
  },

  reducers: {
    addAssign(state, action) {
      state.assigns.push(action.payload);
    },

    setSearch(state, action) {
      state.searchTerm = action.payload.toLowerCase();
    },
  },

  extraReducers: (builder) => {
    builder
      /* fetchAssigns */
      .addCase(fetchAssigns.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssigns.fulfilled, (state, action) => {
        state.loading = false;
        state.assigns = action.payload.map(p => ({ ...p }));
      })
      .addCase(fetchAssigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* =====================
   EXPORT
===================== */

export const {
  addAssign,
  setSearch,
} = assignSlice.actions;

export default assignSlice.reducer;
