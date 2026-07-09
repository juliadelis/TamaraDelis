import { Link } from 'react-router-dom';

export function PublicHome() {
  return (
    <main className="min-h-dvh  px-5 py-8 text-left text-[#31231A]">
      <div className="mx-auto flex min-h-[calc(100dvh-64px)] max-w-4xl flex-col justify-center">
        <header className="flex items-center justify-between gap-4">
          <img src="/logo_brown.svg" alt="Tamara Delis Psicologia" className="h-12 w-auto" />
          <Link
            to="/login"
            className="rounded-md border border-[#6A3710] px-4 py-2 text-sm font-semibold text-[#6A3710] transition hover:bg-[#F5E0C6]"
          >
            Entrar
          </Link>
        </header>

        <section className="mt-14 max-w-3xl">
          
          <h1 className="mt-3 text-4xl font-bold leading-tight text-[#3A1C0B] sm:text-5xl">
            Tamara Delis Psicologia
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#55422F]">
            Plataforma de organização clínica para acompanhamento de pacientes, agenda,
            sessões, relatórios emocionais e financeiro em um só lugar.
          </p>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-[#D79A69] bg-white p-5">
            <h2 className="font-bold text-[#502815]">Agenda e sessões</h2>
            <p className="mt-2 text-sm leading-6 text-[#55422F]">
              Registre atendimentos, remarcações, presença, faltas e detalhes de cada sessão.
            </p>
          </div>
          <div className="rounded-md border border-[#D79A69] bg-white p-5">
            <h2 className="font-bold text-[#502815]">Relatórios</h2>
            <p className="mt-2 text-sm leading-6 text-[#55422F]">
              Visualize escalas mensais de humor e ansiedade a partir das sessões realizadas.
            </p>
          </div>
          <div className="rounded-md border border-[#D79A69] bg-white p-5">
            <h2 className="font-bold text-[#502815]">Financeiro</h2>
            <p className="mt-2 text-sm leading-6 text-[#55422F]">
              Acompanhe pagamentos, valores por paciente e totais mensais recebidos.
            </p>
          </div>
        </section>

       

        <footer className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#6A3710]">
          <Link to="/politica-de-privacidade" className="font-semibold underline">
            Política de Privacidade
          </Link>
          <Link to="/termos-de-servico" className="font-semibold underline">
            Termos de Serviço
          </Link>
          <Link to="/login" className="font-semibold underline">
            Login
          </Link>
        </footer>
      </div>
    </main>
  );
}
