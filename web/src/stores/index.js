import { configureStore } from "@reduxjs/toolkit";
import productReducer from "@/stores/productSlice";
import stageReducer from "@/stores/stageSlice";
import assignReducer from "@/stores/assignSlice";

export const store = configureStore({
  reducer: {
    product: productReducer,
    stage: stageReducer,
    assign: assignReducer,
  },
});