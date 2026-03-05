import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ProductService from "@/services/Product.service";

/* =====================
   ASYNC THUNKS
===================== */

// fetchProducts
export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const products = await ProductService.getAllProduct({});
      return products;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// updateProduct
export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await ProductService.updateProduct(payload.id, payload);
      dispatch(fetchProducts());
      return payload;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* =====================
   SLICE
===================== */

const ProductSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    loading: false,
    searchTerm: "",
    error: null,
  },

  reducers: {
    addProduct(state, action) {
      state.products.push(action.payload);
    },

    setSearch(state, action) {
      state.searchTerm = action.payload.toLowerCase();
    },
  },

  extraReducers: (builder) => {
    builder
      /* fetchProducts */
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.map(p => ({ ...p }));
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* =====================
   EXPORT
===================== */

export const {
  addProduct,
  setSearch,
  setStatusFilter,
  setDateRange,
} = ProductSlice.actions;

export default ProductSlice.reducer;
