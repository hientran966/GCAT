import { configureStore } from "@reduxjs/toolkit";
import productReducer from "@/stores/productSlice";
import stageReducer from "@/stores/stageSlice";

export const store = configureStore({
  reducer: {
    product: productReducer,
    stage: stageReducer,
  },
});