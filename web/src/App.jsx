/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navigate from "@/components/Navigate";
import { initSocket, disconnectSocket } from "@/plugins/socket";

/* =======================
   Redux actions
======================= */
import { fetchProducts } from "@/stores/productSlice";

import "@/assets/css/App.css";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  /* =======================
     Socket + Store logic
  ======================= */
  useEffect(() => {
    let socket;
    const user = JSON.parse(localStorage.getItem("user") || "{id: 1}");
    if (!user?.id) return;

    socket = initSocket(user.id);

    return () => {
      disconnectSocket();
    };
  }, []);

  /* =======================
     Lifecycle
  ======================= */
  useEffect(() => {
    //window.addEventListener("auth-changed", checkAuth);
    window.addEventListener("forbidden", () => {
      navigate("/not-found", { replace: true });
    });

    return () => {
      //window.removeEventListener("auth-changed", checkAuth);
      disconnectSocket();
    };
  }, []);

  /* =======================
     Render
  ======================= */
  return (
    <div className="common-layout">
      <div className="navigation">
        <Navigate />
      </div>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
