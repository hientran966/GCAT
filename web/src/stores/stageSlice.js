import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import StageService from "@/services/Stage.service";

/* =====================
   ASYNC THUNKS
===================== */

// fetchStages
export const fetchStages = createAsyncThunk(
  "stage/fetchStages",
  async (productId, { rejectWithValue }) => {
    try {
      const stages = await StageService.getAllStage({ product_id: productId });
      return stages;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// updateStage
export const updateStage = createAsyncThunk(
  "stage/updateStage",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await StageService.updateStage(payload.id, payload);
      dispatch(fetchStages());
      return payload;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* =====================
   SLICE
===================== */

const StageSlice = createSlice({
  name: "stage",
  initialState: {
    stages: [],
    loading: false,
    searchTerm: "",
    error: null,
  },

  reducers: {
    addStage(state, action) {
      state.stages.push(action.payload);
    },

    setSearch(state, action) {
      state.searchTerm = action.payload.toLowerCase();
    },
  },

  extraReducers: (builder) => {
    builder
      /* fetchStages */
      .addCase(fetchStages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStages.fulfilled, (state, action) => {
        state.loading = false;
        state.stages = action.payload.map(p => ({ ...p }));
      })
      .addCase(fetchStages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* =====================
   EXPORT
===================== */

export const {
  addStage,
  setSearch,
} = StageSlice.actions;

export default StageSlice.reducer;
