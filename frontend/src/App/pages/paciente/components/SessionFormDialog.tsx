import { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import type { PatientRecord } from '../../../../shared/models/patient.model';
import type { PatientSession, PatientSessionPayload, SessionStatus } from '../../../../shared/models/session.model';
import { getGoogleCalendarStatus, getGoogleLoginUrl } from '../../../../shared/services/auth';
import { saveSession } from '../../../../shared/services/session';

type SessionFormDialogProps = {
  visible: boolean;
  patient?: PatientRecord;
  patients?: PatientRecord[];
  defaultDate?: Date;
  defaultStartAt?: Date;
  defaultDurationMinutes?: number;
  blankInitialTitle?: boolean;
  session?: PatientSession | null;
  onHide: () => void;
  onSaved: (session: PatientSession) => void;
};

const statusOptions: { value: SessionStatus; label: string }[] = [
  { value: 'scheduled', label: 'Agendada' },
  { value: 'completed', label: 'Realizada' },
  { value: 'rescheduled', label: 'Remarcada' },
  { value: 'missed', label: 'Falta' },
  { value: 'cancelled', label: 'Cancelada' },
];

function toLocalInputValue(value = '') {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromLocalInputValue(value: string) {
  return value ? new Date(value).toISOString() : '';
}

export function SessionFormDialog({
  visible,
  patient,
  patients = [],
  defaultDate,
  defaultStartAt,
  defaultDurationMinutes = 50,
  blankInitialTitle = false,
  session,
  onHide,
  onSaved,
}: SessionFormDialogProps) {
  const defaultStart = useMemo(() => {
    const date = defaultStartAt ? new Date(defaultStartAt) : defaultDate ? new Date(defaultDate) : new Date();
    if (defaultStartAt) {
      date.setSeconds(0, 0);
    } else if (defaultDate) {
      date.setHours(8, 0, 0, 0);
    } else {
      date.setMinutes(0, 0, 0);
    }
    return toLocalInputValue(date.toISOString());
  }, [defaultDate, defaultStartAt]);

  const defaultEnd = useMemo(() => {
    const date = defaultStartAt ? new Date(defaultStartAt) : defaultDate ? new Date(defaultDate) : new Date();
    if (defaultStartAt) {
      date.setSeconds(0, 0);
    } else if (defaultDate) {
      date.setHours(8, 0, 0, 0);
    } else {
      date.setMinutes(0, 0, 0);
    }
    date.setMinutes(date.getMinutes() + defaultDurationMinutes);
    return toLocalInputValue(date.toISOString());
  }, [defaultDate, defaultDurationMinutes, defaultStartAt]);

  const [selectedPatientId, setSelectedPatientId] = useState(
    session?.patientId || patient?.id || patients[0]?.id || ''
  );
  const selectedPatient = patient || patients.find((item) => item.id === selectedPatientId) || null;
  const [title, setTitle] = useState(
    session?.title ||
      (blankInitialTitle ? '' : selectedPatient ? `Sessão - ${selectedPatient.fullName}` : 'Sessão')
  );
  const [sessionNumber, setSessionNumber] = useState(session?.sessionNumber?.toString() || '');
  const [startsAt, setStartsAt] = useState(toLocalInputValue(session?.startsAt) || defaultStart);
  const [endsAt, setEndsAt] = useState(toLocalInputValue(session?.endsAt) || defaultEnd);
  const [status, setStatus] = useState<SessionStatus>(session?.status || 'scheduled');
  const [cid, setCid] = useState(session?.cid || '');
  const [sessionTheme, setSessionTheme] = useState(session?.sessionTheme || '');
  const [sessionMotives, setSessionMotives] = useState(session?.sessionMotives || '');
  const [notes, setNotes] = useState(session?.notes || '');
  const [syncGoogle, setSyncGoogle] = useState(Boolean(session?.googleEventId));
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [checkingGoogle, setCheckingGoogle] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPatientId && !patient && patients[0]) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patient, patients, selectedPatientId]);

  useEffect(() => {
    if (!blankInitialTitle && !session && selectedPatient && (!title || title === 'Sessão')) {
      setTitle(`Sessão - ${selectedPatient.fullName}`);
    }
  }, [blankInitialTitle, selectedPatient, session, title]);

  useEffect(() => {
    const checkGoogle = async () => {
      setCheckingGoogle(true);
      try {
        const status = await getGoogleCalendarStatus();
        setGoogleConnected(status.connected);
        setGoogleEmail(status.googleEmail);
        if (status.connected && !session?.googleEventId) {
          setSyncGoogle(true);
        }
      } catch {
        setGoogleConnected(false);
      } finally {
        setCheckingGoogle(false);
      }
    };

    checkGoogle();
  }, [session]);

  const handleConnectGoogle = async () => {
    setConnectingGoogle(true);
    try {
      window.location.href = await getGoogleLoginUrl(window.location.pathname);
    } catch (err: any) {
      setError(err?.message || 'Erro ao conectar Google Agenda.');
      setConnectingGoogle(false);
    }
  };

  const handleSave = async () => {
    setError(null);

    if (!startsAt || !endsAt) {
      setError('Informe inicio e fim da sessão.');
      return;
    }

    if (!selectedPatient) {
      setError('Selecione um paciente.');
      return;
    }

    if (syncGoogle && !googleConnected) {
      setError('Conecte o Google Agenda antes de sincronizar a sessão.');
      return;
    }

    const payload: PatientSessionPayload = {
      patientId: selectedPatient.id,
      title,
      sessionNumber: sessionNumber ? Number(sessionNumber) : null,
      startsAt: fromLocalInputValue(startsAt),
      endsAt: fromLocalInputValue(endsAt),
      timezone: 'America/Sao_Paulo',
      status,
      cid,
      sessionTheme,
      sessionMotives,
      moodScale: session?.moodScale ?? null,
      anxietyScale: session?.anxietyScale ?? null,
      recurrentThemes: session?.recurrentThemes ?? '',
      rescheduledFromStartsAt: session?.rescheduledFromStartsAt ?? '',
      rescheduledFromEndsAt: session?.rescheduledFromEndsAt ?? '',
      notes,
      syncGoogle,
    };

    setSaving(true);
    try {
      const saved = await saveSession(payload, session?.id);
      onSaved(saved);
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar sessão.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      header={session ? 'Editar sessão' : 'Adicionar sessão'}
      visible={visible}
      onHide={onHide}
      modal
      draggable={false}
      className="mx-4 w-full max-w-2xl"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onHide}
            disabled={saving}
            className="rounded-md border border-[#6A3710] px-4 py-2 text-sm font-semibold text-[#6A3710]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-[#6A3710] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      }
    >
      <div className="grid gap-4 text-left sm:grid-cols-2">
        {!patient ? (
          <label className="text-sm font-medium text-[#502815] sm:col-span-2">
            Paciente
            <select
              value={selectedPatientId}
              onChange={(event) => setSelectedPatientId(event.target.value)}
              className="mt-1 w-full rounded-md border border-[#D9D3CE] px-3 py-2 text-sm"
            >
              <option value="">Selecione um paciente</option>
              {patients.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.fullName}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="text-sm font-medium text-[#502815] sm:col-span-2">
          Titulo
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full rounded-md border border-[#D9D3CE] px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm font-medium text-[#502815]">
          Numero
          <input
            type="number"
            value={sessionNumber}
            onChange={(event) => setSessionNumber(event.target.value)}
            className="mt-1 w-full rounded-md border border-[#D9D3CE] px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm font-medium text-[#502815]">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as SessionStatus)}
            className="mt-1 w-full rounded-md border border-[#D9D3CE] px-3 py-2 text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-[#502815]">
          CID
          <input
            value={cid}
            onChange={(event) => setCid(event.target.value)}
            className="mt-1 w-full rounded-md border border-[#D9D3CE] px-3 py-2 text-sm"
            placeholder="Ex: F41.1"
          />
        </label>

        <label className="text-sm font-medium text-[#502815]">
          Inicio
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            className="mt-1 w-full rounded-md border border-[#D9D3CE] px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm font-medium text-[#502815]">
          Fim
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
            className="mt-1 w-full rounded-md border border-[#D9D3CE] px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm font-medium text-[#502815] sm:col-span-2">
          Tema
          <input
            value={sessionTheme}
            onChange={(event) => setSessionTheme(event.target.value)}
            className="mt-1 w-full rounded-md border border-[#D9D3CE] px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm font-medium text-[#502815] sm:col-span-2">
          Motivos e pontos importantes
          <textarea
            value={sessionMotives}
            onChange={(event) => setSessionMotives(event.target.value)}
            className="mt-1 min-h-24 w-full rounded-md border border-[#D9D3CE] px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm font-medium text-[#502815] sm:col-span-2">
          Observacoes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-1 min-h-20 w-full rounded-md border border-[#D9D3CE] px-3 py-2 text-sm"
          />
        </label>

        <div className="rounded-md border border-[#D9D3CE] p-3 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[#502815]">
            <input
              type="checkbox"
              checked={syncGoogle}
              disabled={!googleConnected}
              onChange={(event) => setSyncGoogle(event.target.checked)}
            />
            Sincronizar com Google Agenda
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#6A3710]">
              {checkingGoogle
                ? 'Verificando conexao...'
                : googleConnected
                ? `Conectado${googleEmail ? ` em ${googleEmail}` : ''}`
                : 'Google Agenda ainda nao conectado.'}
            </p>
            {!googleConnected ? (
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={connectingGoogle}
                className="rounded-md border border-[#6A3710] px-3 py-2 text-xs font-semibold text-[#6A3710] disabled:opacity-60"
              >
                {connectingGoogle ? 'Abrindo Google...' : 'Conectar Google Agenda'}
              </button>
            ) : null}
          </div>
        </div>

        {error ? <p className="text-sm text-[#B42318] sm:col-span-2">{error}</p> : null}
      </div>
    </Dialog>
  );
}
