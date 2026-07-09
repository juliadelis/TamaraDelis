import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { MainLayout } from "../layout";
import { Home } from "../pages/home/Home";
import { Agenda } from "../pages/agenda/Agenda";
import { AgendaDia } from "../pages/agenda/AgendaDia";
import { Financeiro } from "../pages/financeiro/Financeiro";
import { Paciente } from "../pages/paciente/Paciente";
import { PacienteDetalhe } from "../pages/paciente/PacienteDetalhe";
import { NovoPaciente } from "../pages/paciente/NovoPaciente";
import { EditarProntuario } from "../pages/paciente/EditarProntuario";
import { Relatorios } from "../pages/relatorios/Relatorios";
import { Login } from "../pages/login/Login";
import { PublicHome } from "../pages/public/PublicHome";
import { PrivacyPolicy, TermsOfService } from "../pages/public/LegalPages";
import { NoPermission } from "../pages/public/NoPermission";
import { getAuthToken } from "../../shared/services/auth";

const Documentos = lazy(() => import("../pages/documentos/Documentos"));

export function routerFactory() {
  return createBrowserRouter([
    {
      path: "/",
      element: <PublicHome />,
    },
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          element: <AuthGuard />,
          children: [
            { path: "home", element: <Home /> },
            { path: "agenda", element: <Agenda /> },
            { path: "agenda/:date", element: <AgendaDia /> },
            { path: "documentos", element: <LazyRoute><Documentos /></LazyRoute> },
            { path: "financeiro", element: <Financeiro /> },
            { path: "relatorios", element: <Relatorios /> },
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
      path: "politica-de-privacidade",
      element: <PrivacyPolicy />,
    },
    {
      path: "termos-de-servico",
      element: <TermsOfService />,
    },
    {
      path: "sem-permissao",
      element: <NoPermission />,
    },
    {
      path: "*",
      element: <Navigate to={"/"} />,
    },
  ]);
}

function LazyRoute({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[#6B5A4B]">Carregando...</div>}>
      {children}
    </Suspense>
  );
}

function AuthGuard() {
  const token = getAuthToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
