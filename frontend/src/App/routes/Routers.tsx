/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { MainLayout } from "../layout";
import { PublicLayout } from "../layout/PublicLayout";
import { PrivacyPolicy, TermsOfService } from "../pages/public/LegalPages";
import { NoPermission } from "../pages/public/NoPermission";
import { getAuthToken } from "../../shared/services/auth";

const Home = lazy(() =>
  import("../pages/home/Home").then((module) => ({ default: module.Home })),
);
const Agenda = lazy(() =>
  import("../pages/agenda/Agenda").then((module) => ({ default: module.Agenda })),
);
const AgendaDia = lazy(() =>
  import("../pages/agenda/AgendaDia").then((module) => ({
    default: module.AgendaDia,
  })),
);
const Financeiro = lazy(() =>
  import("../pages/financeiro/Financeiro").then((module) => ({
    default: module.Financeiro,
  })),
);
const Paciente = lazy(() =>
  import("../pages/paciente/Paciente").then((module) => ({
    default: module.Paciente,
  })),
);
const PacienteDetalhe = lazy(() =>
  import("../pages/paciente/PacienteDetalhe").then((module) => ({
    default: module.PacienteDetalhe,
  })),
);
const NovoPaciente = lazy(() =>
  import("../pages/paciente/NovoPaciente").then((module) => ({
    default: module.NovoPaciente,
  })),
);
const EditarProntuario = lazy(() =>
  import("../pages/paciente/EditarProntuario").then((module) => ({
    default: module.EditarProntuario,
  })),
);
const Relatorios = lazy(() =>
  import("../pages/relatorios/Relatorios").then((module) => ({
    default: module.Relatorios,
  })),
);
const Login = lazy(() =>
  import("../pages/login/Login").then((module) => ({ default: module.Login })),
);
const Perfil = lazy(() =>
  import("../pages/perfil/Perfil").then((module) => ({ default: module.Perfil })),
);
const PersonalFinance = lazy(() =>
  import("../pages/perfil/PersonalFinance").then((module) => ({
    default: module.PersonalFinance,
  })),
);

const Documentos = lazy(() => import("../pages/documentos/Documentos"));
const PublicHome = lazy(() =>
  import("../pages/public/home/PublicHome").then((module) => ({
    default: module.PublicHome,
  }))
);
const FaqPage = lazy(() =>
  import("../pages/public/duvidas/FaqPage").then((module) => ({
    default: module.FaqPage,
  }))
);
const AboutPage = lazy(() =>
  import("../pages/public/sobre-mim/AboutPage").then((module) => ({
    default: module.AboutPage,
  }))
);
const PsicoterapiaPage = lazy(() =>
  import("../pages/public/psicoterapia/PsicoterapiaPage").then((module) => ({
    default: module.PsicoterapiaPage,
  }))
);

export function routerFactory() {
  return createBrowserRouter([
    {
      path: "/",
      element: <PublicLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={null}>
              <PublicHome />
            </Suspense>
          ),
        },
        { path: "sobre-mim", element: <Suspense fallback={null}><AboutPage /></Suspense> },
        { path: "psicoterapia", element: <Suspense fallback={null}><PsicoterapiaPage /></Suspense> },
        { path: "duvidas", element: <Suspense fallback={null}><FaqPage /></Suspense> },
        { path: "politica-de-privacidade", element: <PrivacyPolicy /> },
        { path: "termos-de-servico", element: <TermsOfService /> },
      ],
    },
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          element: <AuthGuard />,
          children: [
            { path: "home", element: <LazyRoute><Home /></LazyRoute> },
            { path: "perfil", element: <LazyRoute><Perfil /></LazyRoute> },
            { path: "perfil/financas-pessoais", element: <LazyRoute><PersonalFinance /></LazyRoute> },
            { path: "agenda", element: <LazyRoute><Agenda /></LazyRoute> },
            { path: "agenda/:date", element: <LazyRoute><AgendaDia /></LazyRoute> },
            { path: "documentos", element: <LazyRoute><Documentos /></LazyRoute> },
            { path: "financeiro", element: <LazyRoute><Financeiro /></LazyRoute> },
            { path: "relatorios", element: <LazyRoute><Relatorios /></LazyRoute> },
            { path: "pacientes", element: <LazyRoute><Paciente /></LazyRoute> },
            { path: "pacientes/novo", element: <LazyRoute><NovoPaciente /></LazyRoute> },
            { path: "pacientes/:patientId", element: <LazyRoute><PacienteDetalhe /></LazyRoute> },
            { path: "pacientes/:patientId/editar", element: <LazyRoute><EditarProntuario /></LazyRoute> },
          ],
        },
      ],
    },
    {
      path: "login",
      element: <LazyRoute><Login /></LazyRoute>,
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
