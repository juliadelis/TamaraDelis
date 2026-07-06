import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineHome } from "react-icons/ai";
import { IoCalendarClearOutline } from "react-icons/io5";
import { PiMoneyWavyLight } from "react-icons/pi";
import { MdOutlineAutoGraph } from "react-icons/md";
import { BsPersonBadge } from "react-icons/bs";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  { label: "Home", icon: <AiOutlineHome size={24} />, path: "/" },
  { label: "Agenda", icon: <IoCalendarClearOutline size={22} />, path: "/agenda" },
  { label: "Financeiro", icon: <PiMoneyWavyLight size={25} />, path: "/financeiro" },
  { label: "Relatórios", icon: <MdOutlineAutoGraph size={24} />, path: "/relatorios" },
  { label: "Pacientes", icon: <BsPersonBadge size={23} />, path: "/pacientes" },
];

export function BottomMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <nav
      className="border-t border-gray-200 bg-white shadow-lg"
      aria-label="Menu principal"
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "1126px",
        zIndex: 9999,
      }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`flex h-16 flex-col items-center justify-center w-full transition-colors gap-1 ${
                isActive
                  ? "text-[#6A3710] border-t-2 border-[#6A3710]"
                  : "text-[#1E1E1E] hover:text-[#6A3710]"
              }`}
            >
              <div className="h-6 flex items-center justify-center">{item.icon}</div>
              <span className={`text-xs ${isActive ? "font-bold" : "font-regular"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
