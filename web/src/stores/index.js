import { configureStore } from "@reduxjs/toolkit";
import productReducer from "@/stores/productSlice";

export const store = configureStore({
  reducer: {
    product: productReducer,
  },
});