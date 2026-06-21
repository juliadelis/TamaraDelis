import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "../layout";
import { Home } from "../pages/home/Home";
import { Agenda } from "../pages/agenda/Agenda";
import { Paciente } from "../pages/paciente/Paciente";
import { PacienteDetalhe } from "../pages/paciente/PacienteDetalhe";
import { NovoPaciente } from "../pages/paciente/NovoPaciente";
import { EditarProntuario } from "../pages/paciente/EditarProntuario";
import { Login } from "../pages/login/Login";
import { getAuthToken } from "../../shared/services/auth";

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
            { path: "agenda", element: <Agenda /> },
            { path: "pacientes", element: <Paciente /> },
            { path: "pacientes/novo", element: <NovoPaciente /> },
            { path: "pacientes/:patientId", element: <PacienteDetalhe /> },
            { path: "pacientes/:patientId/editar", element: <EditarProntuario /> },
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
  const token = getAuthToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
