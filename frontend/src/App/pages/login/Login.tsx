import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { getGoogleLoginUrl, login, saveAuthSession } from '../../../shared/services/auth';
import "./Login.scss";

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresIn = params.get('expires_in');
    const user = params.get('user');
    const next = params.get('next') || '/';
    const oauthError = params.get('error');

    if (oauthError) {
      setError('Nao foi possivel concluir o login com Google.');
      return;
    }

    if (accessToken && refreshToken && expiresIn && user) {
      saveAuthSession(
        {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: Number(expiresIn),
        },
        JSON.parse(user)
      );
      navigate(next, { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password) {
      setError('Preencha email e senha');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      window.location.href = await getGoogleLoginUrl('/');
    } catch (err: any) {
      setError(err?.message || 'Erro ao entrar com Google');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 grid h-dvh w-full max-w-full grid-cols-12 overflow-hidden bg-[#6A3710]">
      <div className="col-span-7 hidden h-dvh min-w-0 overflow-hidden md:block">
        <div className="h-full w-full overflow-hidden">
          <img
            src="/img/login-2.jpg"
            alt="login picture"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="col-span-12 flex min-w-0 flex-col md:col-span-5">
        <div className="flex h-full min-w-0 flex-col items-center justify-center gap-8 p-5">
          <div className="flex items-center justify-center">
            <img src="/logo.svg" alt="logo" />
          </div>
          <div className="flex w-full max-w-sm flex-col gap-8 px-4 sm:px-9">
            <div className="flex flex-col gap-8 items-center justify-center w-full">
              <div className="flex flex-col gap-3 w-full text-left">
                <label htmlFor="email" className="text-white font-light">
                  Email
                </label>
                <InputText
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

              {error && <div className="text-red-200 text-sm">{error}</div>}

              <Button
                onClick={handleSubmit}
                label={loading ? "Entrando..." : "Entrar"}
                disabled={loading}
                className="w-full p-3 rounded-lg shadow-none border-none text-[#6A3710]"
                style={{ backgroundColor: "#EDD8C1", borderColor: "#EDD8C1", color: "#6A3710" }}
              />
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full rounded-lg border border-[#EDD8C1] bg-transparent p-3 font-semibold text-[#EDD8C1] transition hover:bg-[#502815] disabled:opacity-60"
              >
                {googleLoading ? 'Abrindo Google...' : 'Entrar com Google'}
              </button>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-[#EDD8C1]">
                <Link to="/politica-de-privacidade" className="underline underline-offset-2">
                  Política de Privacidade
                </Link>
                <span aria-hidden="true">•</span>
                <Link to="/termos-de-servico" className="underline underline-offset-2">
                  Termos de Serviço
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
