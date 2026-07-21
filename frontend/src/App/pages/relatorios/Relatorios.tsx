import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PatientRecord } from '../../../shared/models/patient.model';
import type { PatientSession } from '../../../shared/models/session.model';
import { getPatientRecord } from '../../../shared/services/patient';
import { deleteSession, getSessions, type DeleteSessionScope } from '../../../shared/services/session';
import { SessionDetailsDialog } from '../agenda/components/SessionDetailsDialog';
import { SessionFormDialog } from '../paciente/components/SessionFormDialog';
import { PatientSelect } from '../../../shared/components/PatientSelect/PatientSelect';

function formatInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Relatorios() {
  const today = useMemo(() => new Date(), []);
  const firstDay = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);
  const lastDay = useMemo(() => new Date(today.getFullYear(), today.getMonth() + 1, 0), [today]);

  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [from, setFrom] = useState(formatInputDate(firstDay));
  const [to, setTo] = useState(formatInputDate(lastDay));
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<PatientSession | null>(null);
  const [editingSession, setEditingSession] = useState<PatientSession | null>(null);
  const [deletingSession, setDeletingSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setPatients(await getPatientRecord());
      } catch (err) {
        console.error(err);
      }
    };

    loadPatients();
  }, []);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setSessions(
        await getSessions({
          patientId: selectedPatientId,
          from: from ? `${from}T00:00:00.000Z` : undefined,
          to: to ? `${to}T23:59:59.999Z` : undefined,
        })
      );
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar sessoes.');
    } finally {
      setLoading(false);
    }
  }, [from, selectedPatientId, to]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleSessionSaved = async (session: PatientSession) => {
    setSelectedSession(session);
    setEditingSession(null);
    await loadSessions();
  };

  const handleDeleteSession = async (scope: DeleteSessionScope = 'single') => {
    if (!selectedSession) return;

    setDeletingSession(true);
    try {
      await deleteSession(selectedSession.id, Boolean(selectedSession.googleEventId), scope);
      setSelectedSession(null);
      await loadSessions();
    } catch (err: any) {
      setError(err?.message || 'Erro ao excluir sessao.');
    } finally {
      setDeletingSession(false);
    }
  };

  return (
    <div className="mx-auto max-w-full text-left">
      <section className="pb-8">
        <h1 className="text-3xl font-semibold text-[#502815]">Relatórios</h1>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <label className="text-sm font-semibold text-[#502815]">
            De
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="mt-1 block w-full rounded-md border border-[#D79A69] bg-white px-3 py-2 text-sm font-semibold text-[#502815] outline-none"
            />
          </label>

          <label className="text-sm font-semibold text-[#502815]">
            Ate
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="mt-1 block w-full rounded-md border border-[#D79A69] bg-white px-3 py-2 text-sm font-semibold text-[#502815] outline-none"
            />
          </label>

          <label className="text-sm font-semibold text-[#502815]">
            Paciente
            <PatientSelect
              value={selectedPatientId}
              onChange={setSelectedPatientId}
              patients={patients}
              placeholder="Todos os pacientes"
              className="mt-1 border-[#D79A69] font-semibold text-[#502815]"
            />
          </label>
        </div>

        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[#3A1C0B]">Sessões agendadas</h2>
            <span className="text-xs font-semibold text-[#8A6A4F]">
              {sessions.length} {sessions.length === 1 ? 'sessão' : 'sessões'}
            </span>
          </div>

          {loading ? (
            <p className="rounded-md border border-[#D79A69] p-4 text-sm text-[#55422f]">
              Carregando sessões...
            </p>
          ) : error ? (
            <p className="rounded-md border border-[#B42318] bg-[#FEE4E2] p-4 text-sm text-[#B42318]">
              {error}
            </p>
          ) : sessions.length === 0 ? (
            <p className="rounded-md border border-[#D79A69] p-4 text-sm text-[#55422f]">
              Nenhuma sessão encontrada para os filtros selecionados.
            </p>
          ) : (
            <div className="overflow-hidden rounded-sm border border-[#E8C6A8]">
              <div className="grid grid-cols-[5.5rem_5rem_1fr] gap-3 bg-white px-3 py-2 text-xs font-bold text-[#6A3710]">
                <span>Data</span>
                <span>Horário</span>
                <span>Paciente</span>
              </div>
              {sessions.map((session, index) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setSelectedSession(session)}
                  className={`grid w-full grid-cols-[5.5rem_5rem_1fr] gap-3 px-3 py-3 text-left text-sm text-[#111111] transition hover:bg-[#F5E0C6] ${
                    index % 2 === 0 ? 'bg-[#FFF8ED]' : 'bg-white'
                  }`}
                  aria-label={`Ver detalhes da sessao de ${session.patientName || session.title || formatDate(session.startsAt)}`}
                >
                  <span>{formatDate(session.startsAt)}</span>
                  <span>{formatTime(session.startsAt)}</span>
                  <span className="min-w-0 truncate font-semibold">
                    {session.patientName || session.title || 'Paciente sem nome'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <SessionDetailsDialog
        visible={Boolean(selectedSession)}
        session={selectedSession}
        deleting={deletingSession}
        onHide={() => setSelectedSession(null)}
        onEdit={() => {
          if (!selectedSession) return;
          setEditingSession(selectedSession);
          setSelectedSession(null);
        }}
        onDelete={handleDeleteSession}
        onSaved={handleSessionSaved}
      />

      {editingSession ? (
        <SessionFormDialog
          visible={Boolean(editingSession)}
          session={editingSession}
          onHide={() => setEditingSession(null)}
          onSaved={handleSessionSaved}
        />
      ) : null}
    </div>
  );
}

