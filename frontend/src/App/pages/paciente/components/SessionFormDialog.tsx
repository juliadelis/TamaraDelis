import { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { PatientSelect } from '../../../../shared/components/PatientSelect/PatientSelect';
import type { PatientRecord } from '../../../../shared/models/patient.model';
import type {
  PatientSession,
  PatientSessionPayload,
  SessionModality,
  SessionRecurrenceType,
  SessionStatus,
} from '../../../../shared/models/session.model';
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
  { value: 'cancelled', label: 'Cancelamento' },
];

const recurrenceOptions: { value: SessionRecurrenceType; label: string }[] = [
  { value: 'none', label: 'Nenhum' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'biweekly', label: 'Quinzenal' },
  { value: 'weekly', label: '1 vez por semana' },
  { value: 'twiceWeekly', label: '2 vezes por semana' },
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

function dateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addMonthsKeepingDay(value: Date, amount: number) {
  const next = new Date(value);
  const day = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + amount);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, lastDay));
  return next;
}

function nextOccurrenceDate(current: Date, recurrence: SessionRecurrenceType, index: number) {
  const next = new Date(current);

  if (recurrence === 'monthly') {
    return addMonthsKeepingDay(next, 1);
  }

  if (recurrence === 'biweekly') {
    next.setDate(next.getDate() + 14);
    return next;
  }

  if (recurrence === 'weekly') {
    next.setDate(next.getDate() + 7);
    return next;
  }

  if (recurrence === 'twiceWeekly') {
    next.setDate(next.getDate() + (index % 2 === 0 ? 3 : 4));
    return next;
  }

  return next;
}

function buildOccurrenceDates(start: string, end: string, recurrence: SessionRecurrenceType, recurrenceEndDate: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const duration = endDate.getTime() - startDate.getTime();

  if (recurrence === 'none') {
    return [{ startsAt: startDate, endsAt: endDate }];
  }

  const limit = new Date(`${recurrenceEndDate}T23:59:59`);
  const occurrences = [{ startsAt: startDate, endsAt: endDate }];
  let currentStart = startDate;
  let index = 0;

  while (true) {
    const nextStart = nextOccurrenceDate(currentStart, recurrence, index);
    if (nextStart.getTime() > limit.getTime()) {
      break;
    }

    occurrences.push({
      startsAt: nextStart,
      endsAt: new Date(nextStart.getTime() + duration),
    });
    currentStart = nextStart;
    index += 1;
  }

  return occurrences;
}

function generateRecurrenceGroupId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `recurrence-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
  const [recurrence, setRecurrence] = useState<SessionRecurrenceType>(session?.recurrenceType || 'none');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(() => dateInputValue(new Date(defaultStart)));
  const [status, setStatus] = useState<SessionStatus>(session?.status || 'scheduled');
  const [cid, setCid] = useState(session?.cid || '');
  const [sessionTheme, setSessionTheme] = useState(session?.sessionTheme || '');
  const [sessionMotives, setSessionMotives] = useState(session?.sessionMotives || '');
  const [notes, setNotes] = useState(session?.notes || '');
  const [modality, setModality] = useState<SessionModality>(session?.type || 'online');
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
    if (session || !startsAt) return;

    const startDate = new Date(startsAt);
    if (!Number.isNaN(startDate.getTime())) {
      setRecurrenceEndDate((current) => current || dateInputValue(startDate));
    }
  }, [session, startsAt]);

  useEffect(() => {
    const checkGoogle = async () => {
      setCheckingGoogle(true);
      try {
        const status = await getGoogleCalendarStatus();
        setGoogleConnected(status.connected);
        setGoogleEmail(status.googleEmail);
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

    if (modality === 'online' && !googleConnected) {
      setError('Conecte o Google Agenda antes de sincronizar a sessão.');
      return;
    }

    if (modality === 'online' && !selectedPatient.email?.trim()) {
      setError('Cadastre o e-mail do paciente antes de criar uma sessão online.');
      return;
    }

    if (recurrence !== 'none' && !recurrenceEndDate) {
      setError('Informe a data final da periodicidade.');
      return;
    }

    if (recurrence !== 'none') {
      const startDate = new Date(startsAt);
      const limitDate = new Date(`${recurrenceEndDate}T23:59:59`);

      if (Number.isNaN(limitDate.getTime()) || limitDate.getTime() < startDate.getTime()) {
        setError('A data final da periodicidade deve ser igual ou posterior ao inicio da sessao.');
        return;
      }
    }

    const shouldCreateFutureSessions = recurrence !== 'none' && (!session || !session.recurrenceGroupId);
    const recurrenceGroupId =
      recurrence === 'none' ? undefined : session?.recurrenceGroupId || generateRecurrenceGroupId();

    const payload: PatientSessionPayload = {
      patientId: selectedPatient.id,
      title,
      sessionNumber: sessionNumber ? Number(sessionNumber) : null,
      startsAt: fromLocalInputValue(startsAt),
      endsAt: fromLocalInputValue(endsAt),
      timezone: 'America/Sao_Paulo',
      status,
      type: modality,
      cid,
      sessionTheme,
      sessionMotives,
      moodScale: session?.moodScale ?? null,
      anxietyScale: session?.anxietyScale ?? null,
      recurrentThemes: session?.recurrentThemes ?? '',
      rescheduledFromStartsAt: session?.rescheduledFromStartsAt ?? '',
      rescheduledFromEndsAt: session?.rescheduledFromEndsAt ?? '',
      recurrenceGroupId,
      recurrenceType: recurrence,
      notes,
      syncGoogle: modality === 'online',
    };

    setSaving(true);
    try {
      if (!shouldCreateFutureSessions) {
        const saved = await saveSession(payload, session?.id);
        onSaved(saved);
        return;
      }

      const occurrences = buildOccurrenceDates(startsAt, endsAt, recurrence, recurrenceEndDate);
      const occurrencesToCreate = session ? occurrences.slice(1) : occurrences;

      if (session) {
        const saved = await saveSession(payload, session.id);
        onSaved(saved);
      }

      for (const [index, occurrence] of occurrencesToCreate.entries()) {
        const sessionNumberOffset = session ? index + 1 : index;
        const saved = await saveSession({
          ...payload,
          sessionNumber: payload.sessionNumber === null ? null : Number(payload.sessionNumber) + sessionNumberOffset,
          recurrenceGroupId,
          recurrenceType: recurrence,
          startsAt: occurrence.startsAt.toISOString(),
          endsAt: occurrence.endsAt.toISOString(),
        });
        onSaved(saved);
      }
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
            <PatientSelect
              value={selectedPatientId}
              onChange={setSelectedPatientId}
              patients={patients}
              className="mt-1 border-[#D9D3CE]"
            />
          </label>
        ) : null}

        <label className="text-sm font-medium text-[#502815]">
          Modalidade
          <select
            value={modality}
            onChange={(event) => setModality(event.target.value as SessionModality)}
            className="mt-1 w-full rounded-md border border-[#D9D3CE] px-3 py-2 text-sm"
          >
            <option value="online">Online</option>
            <option value="in_person">Presencial</option>
          </select>
        </label>

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

        <label className="text-sm font-medium text-[#502815]">
          Periodicidade
          <select
            value={recurrence}
            onChange={(event) => setRecurrence(event.target.value as SessionRecurrenceType)}
            className="mt-1 w-full rounded-md border border-[#D9D3CE] px-3 py-2 text-sm"
          >
            {recurrenceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        

        {recurrence !== 'none' ? (
          <label className="text-sm font-medium text-[#502815]">
            Data final
            <input
              type="date"
              value={recurrenceEndDate}
              onChange={(event) => setRecurrenceEndDate(event.target.value)}
              className="mt-1 w-full rounded-md border border-[#D9D3CE] px-3 py-2 text-sm"
            />
          </label>
        ) : null}

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
            className="mt-1 min-h-36 w-full resize-y rounded-md border border-[#D9D3CE] px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm font-medium text-[#502815] sm:col-span-2">
          Observações
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-1 min-h-36 w-full resize-y rounded-md border border-[#D9D3CE] px-3 py-2 text-sm"
          />
        </label>

        {modality === 'online' ? (
        <div className="rounded-md border border-[#D9D3CE] p-3 sm:col-span-2">
          <p className="text-sm font-medium text-[#502815]">Google Agenda e convite por e-mail</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#6A3710]">
              {checkingGoogle
                ? 'Verificando conexao...'
                : googleConnected
                ? `O link do Google Meet e o convite para ${selectedPatient?.email || 'o paciente'} serão criados automaticamente${googleEmail ? ` por ${googleEmail}` : ''}.`
                : 'Google Agenda ainda não conectado.'}
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
        ) : (
          <div className="rounded-md border border-[#D9D3CE] bg-[#FFF8ED] p-3 text-xs text-[#6A3710] sm:col-span-2">
            Sessão presencial: não será criado evento, link do Google Meet ou notificação para o paciente.
          </div>
        )}

        {error ? <p className="text-sm text-[#B42318] sm:col-span-2">{error}</p> : null}
      </div>
    </Dialog>
  );
}
