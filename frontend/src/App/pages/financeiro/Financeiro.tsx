import { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Link } from 'react-router-dom';
import type { MonthlyFinancialSummary } from '../../../shared/models/finance.model';
import { getMonthlyFinancialSummary } from '../../../shared/services/finance';

type FinancialReportFilter = 'all' | 'paid' | 'upcoming' | 'completedUnpaid';

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Marco',
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

const REPORT_FILTERS: { value: FinancialReportFilter; label: string }[] = [
  { value: 'all', label: 'Relatório geral' },
  { value: 'paid', label: 'Sessões pagas' },
  { value: 'upcoming', label: 'Sessões à fazer' },
  { value: 'completedUnpaid', label: 'Realizadas e não pagas' },
];

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatDate(value = '') {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
}

function formatPaymentMethod(value = '') {
  if (value === 'pix') return 'Pix';
  if (value === 'cash') return 'Dinheiro';
  return '-';
}

function formatPaymentStatus(value = '') {
  if (value === 'paid') return 'Pago';
  if (value === 'cancelled') return 'Cancelado';
  return 'Esperado';
}

function normalizeSearch(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function matchesReportFilter(
  session: MonthlyFinancialSummary['patients'][number]['sessionDetails'][number],
  filter: FinancialReportFilter
) {
  if (filter === 'paid') {
    return session.paymentStatus === 'paid';
  }

  if (filter === 'upcoming') {
    return session.status === 'scheduled';
  }

  if (filter === 'completedUnpaid') {
    return session.status === 'completed' && session.paymentStatus !== 'paid';
  }

  return true;
}

export function Financeiro() {
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [summary, setSummary] = useState<MonthlyFinancialSummary | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [reportFilter, setReportFilter] = useState<FinancialReportFilter>('all');
  const [search, setSearch] = useState('');
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

  const patients = useMemo(() => {
    const searchTerm = normalizeSearch(search);

    return (summary?.patients || [])
      .filter((patient) => normalizeSearch(patient.patientName).includes(searchTerm))
      .map((patient) => {
        const sessionDetails = patient.sessionDetails.filter((session) =>
          matchesReportFilter(session, reportFilter)
        );

        return {
          ...patient,
          sessionDetails,
          received: sessionDetails.reduce((total, session) => total + session.receivedAmount, 0),
          expected: sessionDetails.reduce((total, session) => total + session.expectedAmount, 0),
          sessions: sessionDetails.length,
        };
      })
      .filter((patient) => patient.sessions > 0 || reportFilter === 'all');
  }, [reportFilter, search, summary]);

  const totalReceived = patients.reduce((total, patient) => total + patient.received, 0);
  const totalExpected = patients.reduce((total, patient) => total + patient.expected, 0);
  const totalSessions = patients.reduce((total, patient) => total + patient.sessions, 0);
  const selectedPatient = patients.find((patient) => patient.patientId === selectedPatientId) || null;

  useEffect(() => {
    if (selectedPatientId && !patients.some((patient) => patient.patientId === selectedPatientId)) {
      setSelectedPatientId('');
    }
  }, [patients, selectedPatientId]);

  return (
    <div className="mx-auto max-w-full text-left">
      <section className="pb-8">
        <h2 className="text-left text-3xl font-semibold text-[#502815]">Financeiro</h2>

        <div className="mt-5 flex flex-wrap gap-3">
          <label className="text-sm font-semibold text-[#502815]">
            Mes
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="mt-1 block rounded-md border border-[#D79A69] px-3 py-2 text-sm font-semibold text-[#502815] outline-none"
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

          <label className="text-sm font-semibold text-[#502815]">
            Relatorio
            <select
              value={reportFilter}
              onChange={(event) => setReportFilter(event.target.value as FinancialReportFilter)}
              className="mt-1 block rounded-md border border-[#D79A69] bg-white px-3 py-2 text-sm font-semibold text-[#502815] outline-none"
            >
              {REPORT_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="min-w-[220px] flex-1 text-sm font-semibold text-[#502815]">
            Buscar paciente
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="mt-1 block w-full rounded-md border border-[#D79A69] bg-white px-3 py-2 text-sm font-semibold text-[#502815] outline-none"
              placeholder="Nome do paciente"
            />
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
            Nenhuma sessao encontrada para os filtros selecionados.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-[1fr_minmax(5.5rem,auto)_minmax(5.5rem,auto)] gap-3 border-b border-[#E8C6A8] pb-2 text-xs font-bold text-[#6A3710]">
              <span>Paciente</span>
              <span className="text-right">Recebido</span>
              <span className="text-right">Esperado</span>
            </div>
            {patients.map((patient) => (
              <div
                key={patient.patientId}
                className="grid grid-cols-[1fr_minmax(5.5rem,auto)_minmax(5.5rem,auto)] items-center gap-3 text-sm"
              >
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedPatientId(patient.patientId)}
                    className={`block max-w-full truncate text-left font-medium underline-offset-2 hover:underline ${
                      selectedPatientId === patient.patientId ? 'text-[#6A3710]' : 'text-[#111111]'
                    }`}
                  >
                    {patient.patientName}
                  </button>
                  <p className="text-xs text-[#8A6A4F]">
                    {patient.sessions} {patient.sessions === 1 ? 'sessao' : 'sessoes'}
                  </p>
                </div>
                <p className="text-right font-semibold text-[#111111]">{formatCurrency(patient.received)}</p>
                <p className="text-right font-semibold text-[#111111]">{formatCurrency(patient.expected)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-sm border border-[#C8793D] bg-[#FFF8ED] px-3 py-4">
            <p className="text-xs font-bold text-[#6A3710]">Recebido</p>
            <p className="mt-3 text-xl font-bold text-[#6A3710]">{formatCurrency(totalReceived)}</p>
          </div>
          <div className="rounded-sm border border-[#C8793D] bg-[#FFF8ED] px-3 py-4">
            <p className="text-xs font-bold text-[#6A3710]">Esperado</p>
            <p className="mt-3 text-xl font-bold text-[#6A3710]">{formatCurrency(totalExpected)}</p>
          </div>
          <div className="rounded-sm border border-[#C8793D] bg-[#FFF8ED] px-3 py-4">
            <p className="text-xs font-bold text-[#6A3710]">Sessoes</p>
            <p className="mt-3 text-xl font-bold text-[#6A3710]">{totalSessions}</p>
          </div>
        </div>
      </section>

      <Dialog
        header={
          selectedPatient ? (
            <span>
              Resumo financeiro -{' '}
              <Link
                to={`/pacientes/${selectedPatient.patientId}`}
                onClick={() => setSelectedPatientId('')}
                className="text-[#6A3710] underline underline-offset-2"
              >
                {selectedPatient.patientName}
              </Link>
            </span>
          ) : (
            'Resumo financeiro'
          )
        }
        visible={Boolean(selectedPatient)}
        onHide={() => setSelectedPatientId('')}
        modal
        draggable={false}
        className="mx-4 w-full max-w-3xl"
        contentClassName="max-h-[75vh] overflow-y-auto"
      >
        {selectedPatient ? (
          <div className="text-left">
            <div className="grid gap-3 border-b border-[#E8C6A8] pb-4 sm:grid-cols-[1fr_auto_auto] sm:items-start">
              <div className="min-w-0">
                <div className="mt-1 grid gap-1 text-xs text-[#55422f] sm:grid-cols-2">
                  <span>{selectedPatient.patientEmail || 'Email nao informado'}</span>
                  <span>{selectedPatient.patientPhone || 'Telefone nao informado'}</span>
                  <span>Valor atual: {formatCurrency(selectedPatient.currentSessionPrice || 0)}</span>
                  <span>Sessoes/mes: {selectedPatient.monthlySessions || '-'}</span>
                </div>
                {selectedPatient.mainComplaint ? (
                  <p className="mt-2 text-xs text-[#55422f]">{selectedPatient.mainComplaint}</p>
                ) : null}
              </div>
              <div className="rounded-sm bg-[#FFF8ED] px-3 py-2">
                <p className="text-xs font-bold text-[#6A3710]">Recebido</p>
                <p className="text-sm font-bold text-[#3A1C0B]">{formatCurrency(selectedPatient.received)}</p>
              </div>
              <div className="rounded-sm bg-[#FFF8ED] px-3 py-2">
                <p className="text-xs font-bold text-[#6A3710]">Esperado</p>
                <p className="text-sm font-bold text-[#3A1C0B]">{formatCurrency(selectedPatient.expected)}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-[4.5rem_1fr_minmax(4.5rem,auto)_minmax(4.5rem,auto)] gap-2 text-xs font-bold text-[#6A3710]">
                <span>Data</span>
                <span>Sessao</span>
                <span className="text-right">Feito</span>
                <span className="text-right">Esperado</span>
              </div>
              {selectedPatient.sessionDetails.map((session) => (
                <div
                  key={session.id}
                  className="grid grid-cols-[4.5rem_1fr_minmax(4.5rem,auto)_minmax(4.5rem,auto)] gap-2 rounded-sm bg-[#FFF8ED] px-2 py-2 text-xs text-[#111111]"
                >
                  <span>{formatDate(session.startsAt)}</span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{session.title || 'Sessao'}</p>
                    <p className="text-[#8A6A4F]">
                      {formatPaymentStatus(session.paymentStatus)}
                      {session.paymentStatus === 'paid' ? ` - ${formatPaymentMethod(session.paymentMethod)}` : ''}
                    </p>
                  </div>
                  <span className="text-right font-semibold">
                    {session.paymentStatus === 'paid' ? formatCurrency(session.receivedAmount) : '-'}
                  </span>
                  <span className="text-right font-semibold">{formatCurrency(session.expectedAmount)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
