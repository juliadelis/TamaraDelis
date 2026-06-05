import { Outlet } from "react-router-dom";
import { Logo } from "../../shared/components/Logo/Logo";
import { BottomMenu } from "../../shared/components/BottomMenu/BottomMenu";

export function MainLayout() {
  return (
    <div className="main-layout w-full h-full flex flex-col">
      <Logo />
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-6 py-6">
          <Outlet />
        </div>
      </div>
      <BottomMenu />
    </div>
  );
}
