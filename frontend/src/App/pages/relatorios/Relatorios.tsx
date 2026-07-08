import { useEffect, useMemo, useState } from 'react';
import type { PatientRecord } from '../../../shared/models/patient.model';
import type { PatientSession } from '../../../shared/models/session.model';
import { getPatientRecord } from '../../../shared/services/patient';
import { getSessions } from '../../../shared/services/session';

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

type ChartPoint = {
  id: string;
  label: string;
  value: number;
};

function startOfMonthIso(year: number, month: number) {
  return new Date(year, month - 1, 1, 0, 0, 0, 0).toISOString();
}

function endOfMonthIso(year: number, month: number) {
  return new Date(year, month, 0, 23, 59, 59, 999).toISOString();
}

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

function buildPoints(sessions: PatientSession[], field: 'moodScale' | 'anxietyScale'): ChartPoint[] {
  return sessions
    .filter((session) => session[field] !== null && session[field] !== undefined)
    .map((session) => ({
      id: session.id,
      label: formatDateLabel(session.startsAt),
      value: Number(session[field]),
    }));
}

function ScaleChart({ points }: { points: ChartPoint[] }) {
  const width = 340;
  const height = 150;
  const padding = { top: 12, right: 12, bottom: 34, left: 26 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const ticks = [5, 4, 3, 2, 1, 0];

  const positionedPoints = points.map((point, index) => {
    const x = padding.left + (points.length === 1 ? chartWidth / 2 : (index / (points.length - 1)) * chartWidth);
    const y = padding.top + ((5 - point.value) / 5) * chartHeight;
    return { ...point, x, y };
  });

  const linePath = positionedPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const labelIndexes = new Set(
    points.length <= 3
      ? points.map((_, index) => index)
      : [0, Math.floor((points.length - 1) / 2), points.length - 1]
  );

  if (points.length === 0) {
    return (
      <div className="flex h-[150px] items-center justify-center border-b border-[#D8C0A3] text-sm text-[#8A6A4F]">
        Nenhuma escala registrada neste período.
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[150px] w-full" role="img">
      {ticks.map((tick) => {
        const y = padding.top + ((5 - tick) / 5) * chartHeight;
        return (
          <g key={tick}>
            <text x={2} y={y + 4} className="fill-[#8A6A4F] text-[10px]">
              {tick}
            </text>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#D9D3CE"
              strokeWidth="1"
            />
          </g>
        );
      })}

      <path d={linePath} fill="none" stroke="#6A3710" strokeWidth="2" />

      {positionedPoints.map((point) => (
        <circle key={point.id} cx={point.x} cy={point.y} r="4" fill="#FFF8ED" stroke="#6A3710" strokeWidth="2" />
      ))}

      {positionedPoints.map((point, index) =>
        labelIndexes.has(index) ? (
          <text key={`${point.id}-label`} x={point.x} y={height - 8} textAnchor="middle" className="fill-[#111111] text-[10px]">
            {point.label}
          </text>
        ) : null
      )}
    </svg>
  );
}

export function Relatorios() {
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const yearOptions = useMemo(() => {
    const currentYear = today.getFullYear();
    return Array.from({ length: 9 }, (_, index) => currentYear - 4 + index);
  }, [today]);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await getPatientRecord();
        setPatients(data);
        setSelectedPatientId((current) => current || data[0]?.id || '');
      } catch (err) {
        console.error(err);
      }
    };

    loadPatients();
  }, []);

  useEffect(() => {
    const loadSessions = async () => {
      if (!selectedPatientId) {
        setSessions([]);
        return;
      }

      setLoading(true);
      setError('');
      try {
        setSessions(
          await getSessions({
            patientId: selectedPatientId,
            status: 'completed',
            from: startOfMonthIso(year, month),
            to: endOfMonthIso(year, month),
          })
        );
      } catch (err: any) {
        setError(err?.message || 'Erro ao carregar relatórios.');
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [month, selectedPatientId, year]);

  const moodPoints = useMemo(() => buildPoints(sessions, 'moodScale'), [sessions]);
  const anxietyPoints = useMemo(() => buildPoints(sessions, 'anxietyScale'), [sessions]);

  return (
    <div className="mx-auto max-w-full text-left">
      <section className="pb-8">
        <h1 className="text-3xl font-semibold text-[#502815]">Relatórios</h1>

        <div className="mt-5 flex flex-wrap gap-3">
          <label className="text-sm font-semibold text-[#502815]">
            Mês
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
        </div>

        <label className="mt-5 block text-sm font-semibold text-[#502815]">
          Paciente
          <select
            value={selectedPatientId}
            onChange={(event) => setSelectedPatientId(event.target.value)}
            className="mt-1 block w-full rounded-md border border-[#D79A69] bg-white px-3 py-2 text-sm text-[#111111] outline-none"
          >
            <option value="">Selecione um paciente</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName}
              </option>
            ))}
          </select>
        </label>

        {loading ? (
          <p className="mt-6 rounded-md border border-[#D79A69] p-4 text-sm text-[#55422f]">
            Carregando relatórios...
          </p>
        ) : error ? (
          <p className="mt-6 rounded-md border border-[#B42318] bg-[#FEE4E2] p-4 text-sm text-[#B42318]">
            {error}
          </p>
        ) : (
          <div className="mt-7 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-[#6A3710]">Humor</h2>
              <div className="mt-3">
                <ScaleChart points={moodPoints} />
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#6A3710]">Ansiedade</h2>
              <div className="mt-3">
                <ScaleChart points={anxietyPoints} />
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
