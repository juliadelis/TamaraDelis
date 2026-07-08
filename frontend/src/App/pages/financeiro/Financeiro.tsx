import { useEffect, useMemo, useState } from 'react';
import type { MonthlyFinancialSummary } from '../../../shared/models/finance.model';
import { getMonthlyFinancialSummary } from '../../../shared/services/finance';

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function Financeiro() {
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [summary, setSummary] = useState<MonthlyFinancialSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const yearOptions = useMemo(() => {
    const currentYear = today.getFullYear();
    return Array.from({ length: 9 }, (_, index) => currentYear - 4 + index);
  }, [today]);

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      setError('');
      try {
        setSummary(await getMonthlyFinancialSummary(year, month));
      } catch (err: any) {
        setError(err?.message || 'Erro ao carregar financeiro.');
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [month, year]);

  const patients = summary?.patients || [];
  const totalReceived = summary?.totalReceived || 0;
  const totalSessions = summary?.totalSessions || 0;

  return (
    <div className="mx-auto max-w-md text-left">
      <section className="px-4 pb-8 pt-5">
        <h2 className="text-left text-3xl font-semibold text-[#502815]">Financeiro</h2>

        <div className="mt-5 flex flex-wrap gap-3">
          <label className="text-sm font-semibold text-[#502815]">
            Mês
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="mt-1 block rounded-md border border-[#D79A69]  px-3 py-2 text-sm font-semibold text-[#502815] outline-none"
            >
              {MONTHS.map((name, index) => (
                <option key={name} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-[#502815]">
            Ano
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="mt-1 block rounded-md border border-[#D79A69] bg-white px-3 py-2 text-sm font-semibold text-[#502815] outline-none"
            >
              {yearOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <h2 className="mt-7 text-base font-bold text-[#3A1C0B]">Pagamentos</h2>

        {loading ? (
          <p className="mt-4 rounded-md border border-[#D79A69] p-4 text-sm text-[#55422f]">
            Carregando financeiro...
          </p>
        ) : error ? (
          <p className="mt-4 rounded-md border border-[#B42318] bg-[#FEE4E2] p-4 text-sm text-[#B42318]">
            {error}
          </p>
        ) : patients.length === 0 ? (
          <p className="mt-4 rounded-md border border-[#D79A69] p-4 text-sm text-[#55422f]">
            Nenhuma sessão realizada neste mês.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {patients.map((patient) => (
              <div key={patient.patientId} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#111111]">{patient.patientName}</p>
                  <p className="text-xs text-[#8A6A4F]">
                    {patient.sessions} {patient.sessions === 1 ? 'sessão' : 'sessões'}
                  </p>
                </div>
                <p className="font-semibold text-[#111111]">{formatCurrency(patient.received)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="rounded-sm border border-[#C8793D] bg-[#FFF8ED] px-3 py-4">
            <p className="text-xs font-bold text-[#6A3710]">Recebido</p>
            <p className="mt-3 text-xl font-bold text-[#6A3710]">{formatCurrency(totalReceived)}</p>
          </div>
          <div className="rounded-sm border border-[#C8793D] bg-[#FFF8ED] px-3 py-4">
            <p className="text-xs font-bold text-[#6A3710]">Sessões</p>
            <p className="mt-3 text-xl font-bold text-[#6A3710]">{totalSessions}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
