import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import "./Login.scss";

export const Login = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-screen bg-[#6A3710] grid grid-cols-12 overflow-hidden">
      <div className="col-span-7 hidden md:block h-screen min-w-0 overflow-hidden">
        <div className="h-full w-full overflow-hidden">
          <img
            src="/img/login-2.jpg"
            alt="login picture"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="col-span-12 md:col-span-5 flex flex-col">
        <div className="p-5 flex flex-col gap-8 h-full items-center justify-center">
          <div className="flex items-center justify-center">
            <img src="/logo.svg" alt="logo" />
          </div>
          <div className="flex flex-col gap-8 px-9 w-full">
            <div className="  flex flex-col gap-8 items-center justify-center">
              <div className="flex flex-col gap-3 w-full text-left">
                <label htmlFor="email" className="text-white font-light">
                  Email
                </label>
                <InputText
                  placeholder="email@email.com"
                  className="w-full p-3 rounded-lg shadow-none border-none text-[#EDD8C1] placeholder-[#EDD8C1]"
                  style={{ backgroundColor: "#502815", borderColor: "#502815", color: "#EDD8C1" }}
                />
              </div>
              <div className="flex flex-col gap-3 w-full text-left">
                <label htmlFor="password" className="text-white font-light">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="***********"
                    className="w-full p-3 rounded-lg shadow-none border-none text-[#EDD8C1] bg-[#502815] login-password-input"
                    style={{ borderColor: "#502815" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#EDD8C1] opacity-80 hover:opacity-100"
                  >
                    <i className={`cursor-pointer pi ${showPassword ? "pi-eye-slash" : "pi-eye"}`} />
                  </button>
                </div>
              </div>

              <Button
                onClick={() => navigate("/")}
                label="Entrar"
                className="w-full p-3 rounded-lg shadow-none border-none text-[#6A3710]"
                style={{ backgroundColor: "#EDD8C1", borderColor: "#EDD8C1", color: "#6A3710" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
