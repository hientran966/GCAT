import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import stageReducer from "./stageSlice";
import assignReducer from "./assignSlice";
import accountReducer from "./accountSlice";

export const store = configureStore({
  reducer: {
    product: productReducer,
    stage: stageReducer,
    assign: assignReducer,
    account: accountReducer,
  },
});