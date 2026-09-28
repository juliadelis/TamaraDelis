import { NavLink, Outlet } from "react-router-dom";
import { Logo } from "../../shared/components/Logo/Logo";
import { BottomMenu } from "../../shared/components/BottomMenu/BottomMenu";

export function MainLayout() {
  return (
    <div className="main-layout flex min-h-dvh w-full flex-col">
      <header className="flex items-center justify-between gap-3 bg-white pr-6">
        <Logo />
        <NavLink
          to="/perfil"
          className={({ isActive }) => `inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6A3710] ${isActive ? 'bg-[#EADBCD] text-[#502815]' : 'text-[#6A3710] hover:bg-[#F8F4F0]'}`}
        >
          <span aria-hidden="true" className="pi pi-user" />
          Meu perfil
        </NavLink>
      </header>
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="px-6 py-6">
          <Outlet />
        </div>
      </div>
      <BottomMenu />
    </div>
  );
}
