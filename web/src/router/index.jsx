import { createBrowserRouter, redirect } from "react-router-dom";
import App from "../App";

import Product from "../pages/Product";
import Stage from "../pages/Stage";
//import NotFound from "../pages/NotFound";

/* =========================
   AUTH GUARD
========================= */
const authGuard = ({ request }) => {
  const token = localStorage.getItem("token");
  const url = new URL(request.url);

  if (!token && url.pathname !== "/") {
    throw redirect("/");
  }

  if (url.pathname === "/forbidden" && !url.searchParams.get("code")) {
    throw redirect("/not-found");
  }

  return null;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    loader: authGuard,
    children: [
      { index: true, element: <Product /> },

      {
        path: "products",
        element: <Product />,
      }, 

      {
        path: "stages",
        element: <Stage />,
      }, 

      {
        path: "*",
        element: <Product />,
        handle: { layout: "empty" },
      },
    ],
  },
]);