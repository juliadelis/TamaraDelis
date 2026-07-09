import { Link } from 'react-router-dom';
import { logout } from '../../../shared/services/auth';

export function NoPermission() {
  return (
    <main className="flex w-full min-h-dvh items-center justify-center  px-5 text-center">
      <section className="w-full max-w-md rounded-md border border-[#D8C0A3] bg-white p-8 shadow-sm">
        <img src="/logo_brown.svg" alt="Tamara Delis" className="mx-auto mb-6 h-14 w-auto" />
        <h1 className="text-2xl font-semibold text-[#502815]">Acesso não permitido</h1>
        <p className="mt-4 text-sm leading-6 text-[#6B5A4B]">
          Seu e-mail não tem permissão para visualizar este sistema. Entre com uma conta autorizada para continuar.
        </p>
        <Link
          to="/login"
          onClick={logout}
          className="mt-6 inline-flex rounded-md bg-[#6A3710] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#502815]"
        >
          Voltar para login
        </Link>
      </section>
    </main>
  );
}
