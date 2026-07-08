import { RouterProvider } from "react-router";
import "./App.css";
import { useMemo } from "react";
import { routerFactory } from "./routes/Routers";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";


function App() {
  const router = useMemo(routerFactory, [1]);
  return (
    <div className="min-h-dvh lg:w-full">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
