import { useEffect, useMemo, useState } from 'react';
import { GoPlusCircle } from 'react-icons/go';
import type { PatientRecord } from '../../../../shared/models/patient.model';
import {
  SESSION_STATUS_CLASS,
  SESSION_STATUS_LABEL,
  type PatientSession,
} from '../../../../shared/models/session.model';
import { getSessions } from '../../../../shared/services/session';
import { SessionFormDialog } from './SessionFormDialog';

type PatientSessionsTabProps = {
  patient: PatientRecord;
};

function formatInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR');
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PatientSessionsTab({ patient }: PatientSessionsTabProps) {
  const today = useMemo(() => new Date(), []);
  const firstDay = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);
  const lastDay = useMemo(() => new Date(today.getFullYear(), today.getMonth() + 1, 0), [today]);

  const [from, setFrom] = useState(formatInputDate(firstDay));
  const [to, setTo] = useState(formatInputDate(lastDay));
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  const loadSessions = async () => {
    setLoading(true);
    try {
      setSessions(
        await getSessions({
          patientId: patient.id,
          from: `${from}T00:00:00.000Z`,
          to: `${to}T23:59:59.999Z`,
        })
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.id, from, to]);

  const handleSaved = (session: PatientSession) => {
    setDialogVisible(false);
    setSessions((current) => {
      const exists = current.some((item) => item.id === session.id);
      const next = exists
        ? current.map((item) => (item.id === session.id ? session : item))
        : [...current, session];

      return next.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    });
  };

  return (
    <div className="text-left">
      <button
        type="button"
        onClick={() => setDialogVisible(true)}
        className="mb-6 inline-flex items-center gap-2 rounded-md bg-[#6A3710] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#502815]"
      >
        <GoPlusCircle size={17} />
        Adicionar sessão
      </button>

      <div className="mb-5">
        <h2 className="mb-3 text-sm font-bold text-[#111111]">Periodo</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="rounded border border-[#6A3710] px-3 py-2 text-sm"
          />
          <span className="text-sm font-semibold text-[#111111]">Ate</span>
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="rounded border border-[#6A3710] px-3 py-2 text-sm"
          />
        </div>
      </div>

      <h2 className="mb-3 text-sm font-bold text-[#111111]">Sessões</h2>
      {loading ? (
        <p className="rounded-md border border-[#D79A69] p-4 text-sm text-[#55422f]">
          Carregando sessões...
        </p>
      ) : sessions.length === 0 ? (
        <p className="rounded-md border border-[#D79A69] p-4 text-sm text-[#55422f]">
          Nenhuma sessão encontrada no periodo.
        </p>
      ) : (
        <div className="overflow-hidden rounded-sm">
          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              className={`grid w-full grid-cols-[104px_1fr_auto] items-center gap-3 border-l-4 px-4 py-3 text-left text-sm text-[#111111] ${SESSION_STATUS_CLASS[session.status]}`}
            >
              <span>{formatDate(session.startsAt)}</span>
              <span className="min-w-0 truncate font-medium">{session.title || patient.fullName}</span>
              <span className="text-xs text-[#55422f]">
                {formatTime(session.startsAt)} - {SESSION_STATUS_LABEL[session.status]}
              </span>
            </button>
          ))}
        </div>
      )}

      {dialogVisible ? (
        <SessionFormDialog
          visible={dialogVisible}
          patient={patient}
          onHide={() => setDialogVisible(false)}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  );
}
