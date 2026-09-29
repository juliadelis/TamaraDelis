import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { getCurrentUser, getUser, logout, type AuthUser } from '../../../shared/services/auth';

function displayText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function formatDate(value: unknown) {
  const text = displayText(value);
  const date = new Date(text);
  return text && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString('pt-BR')
    : 'Não informado';
}

export function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(() => getUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) setError('Não foi possível atualizar os dados do perfil. Tente novamente.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [attempt]);

  const metadata = user?.user_metadata;
  const name = displayText(metadata?.full_name) || displayText(metadata?.name);
  const email = displayText(user?.email);
  const initials = name
    ? name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
    : '';

  const fields = [
    { label: 'Nome', value: name || 'Não informado' },
    { label: 'E-mail', value: email || 'Não informado' },
    { label: 'Telefone', value: displayText(user?.phone) || displayText(metadata?.phone) || 'Não informado' },
    { label: 'Conta criada em', value: formatDate(user?.created_at) },
  ];

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="mx-auto max-w-3xl py-2 text-left">
      <h1 className="text-3xl font-semibold text-[#502815]">Meu perfil</h1>
      <p className="mt-2 text-sm text-[#6B5A4B]">Confira as informações da sua conta.</p>

      <section aria-label="Informações do usuário" aria-busy={loading} className="mt-6 overflow-hidden rounded-2xl border border-[#E8DED5] bg-white shadow-sm">
        <div className="flex items-center gap-4 bg-[#F8F4F0] p-6">
          <div aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#EADBCD] text-xl font-semibold text-[#6A3710]">
            {initials || <FiUser size={28} />}
          </div>
          <div className="min-w-0">
            <h2 className="break-words text-xl font-semibold text-[#502815]">{name || 'Minha conta'}</h2>
            <p className="mt-1 break-all text-sm text-[#6B5A4B]">{email || 'E-mail não informado'}</p>
          </div>
        </div>

        {loading && <p role="status" className="px-6 pt-5 text-sm text-[#6B5A4B]">Atualizando informações...</p>}
        {error && (
          <div role="alert" className="mx-6 mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            <p>{error}</p>
            <button type="button" onClick={() => { setError(''); setLoading(true); setAttempt((value) => value + 1); }} className="mt-2 rounded font-semibold underline focus-visible:outline-2 focus-visible:outline-offset-4">
              Tentar novamente
            </button>
          </div>
        )}

        <dl className="grid gap-6 p-6 sm:grid-cols-2">
          {fields.map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <dt className="text-sm text-[#6B5A4B]">{label}</dt>
              <dd className="mt-1 break-words font-medium text-[#30251D]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-label="Finanças pessoais" className="mt-6 rounded-2xl border border-[#E8DED5] bg-white p-6">
        <h2 className="font-semibold text-[#502815]">Finanças pessoais</h2>
        <p className="mt-2 text-sm text-[#6B5A4B]">Registre suas despesas e acompanhe os recebimentos das sessões, o saldo mensal e os gastos por categoria.</p>
        <Link to="/perfil/financas-pessoais" className="mt-4 inline-flex rounded-xl bg-[#6A3710] px-5 py-3 font-semibold text-white hover:bg-[#502815]">Acessar finanças pessoais</Link>
      </section>

      <section aria-label="Sessão" className="mt-6 rounded-2xl border border-[#E8DED5] bg-white p-6">
        <h2 className="font-semibold text-[#502815]">Sessão</h2>
        <p className="mt-2 text-sm text-[#6B5A4B]">Ao sair, você precisará entrar novamente para acessar o sistema.</p>
        <button type="button" onClick={handleLogout} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-700">
          <FiLogOut aria-hidden="true" size={18} />
          Sair da conta
        </button>
      </section>
    </main>
  );
}
