import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "../layout";
import { Home } from "../pages/home/Home";
import { Login } from "../pages/login/Login";
// import { jwtDecode } from "jwt-decode";



export function routerFactory() {
  return createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          element: <AuthGuard />,
          children: [
            { path: "", element: <Home /> },
           
          ],
        },
      ],
    },
    {
      path: "login",
      element: <Login />,
    },
    {
      path: "*",
      element: <Navigate to={"/"} />,
    },
  ]);
}

function AuthGuard() {
  // const token = localStorage.getItem("authToken");
  // if (!token) {
  //   return <Navigate to="/login" replace />;
  // }

  try {
    // const decoded = jwtDecode<{ exp?: number }>(token);

    // if (!decoded.exp) {
    //   console.warn("Token has no expiration, allowing access");
    //   return <Outlet />;
    // }

    // const expirationTime = decoded.exp * 1000;
    // const currentTime = Date.now();

    // if (expirationTime < currentTime) {
    //   return <Navigate to="/login" replace />;
    // }

    return <Outlet />;
  } catch (error) {
    console.error("Error decoding token:", error);
    // return <Navigate to="/login" replace />;
  }
}
