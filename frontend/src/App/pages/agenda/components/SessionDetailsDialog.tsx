import { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { FiArrowLeft, FiCheck, FiRefreshCw, FiX } from 'react-icons/fi';
import type { PatientSession, PatientSessionPayload, SessionStatus } from '../../../../shared/models/session.model';
import { saveSession } from '../../../../shared/services/session';

type SessionDetailsDialogProps = {
  visible: boolean;
  session: PatientSession | null;
  deleting: boolean;
  onHide: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSaved: (session: PatientSession) => void;
};

const TAG_OPTIONS = ['Ansiedade', 'Trabalho', 'Humor', 'Familia', 'Casal'];

const STATUS_META: Record<SessionStatus, { label: string; chip: string; text: string }> = {
  scheduled: {
    label: 'Pendente',
    chip: 'border-[#CDA131] bg-[#FFF8E6]',
    text: 'text-[#CDA131]',
  },
  completed: {
    label: 'Presente',
    chip: 'border-[#2BA64B] bg-[#E8F8EC]',
    text: 'text-[#2BA64B]',
  },
  missed: {
    label: 'Falta',
    chip: 'border-[#E10415] bg-[#FEE4E6]',
    text: 'text-[#E10415]',
  },
  rescheduled: {
    label: 'Reagendada',
    chip: 'border-[#9647FF] bg-[#F3ECFF]',
    text: 'text-[#9647FF]',
  },
  cancelled: {
    label: 'Cancelada',
    chip: 'border-[#E10415] bg-[#FEE4E6]',
    text: 'text-[#E10415]',
  },
};

function formatTimeRange(session: PatientSession) {
  const start = new Date(session.startsAt).toLocaleTimeString('pt-BR', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const end = new Date(session.endsAt).toLocaleTimeString('pt-BR', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${start} - ${end}`;
}

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

function formatRescheduleTag(value: string) {
  const date = new Date(fromLocalInputValue(value));
  if (Number.isNaN(date.getTime())) return 'Reagendamento';

  return `Reagendamento ${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function buildPayload(
  session: PatientSession,
  updates: Partial<PatientSessionPayload>
): PatientSessionPayload {
  return {
    patientId: session.patientId,
    title: updates.title ?? session.title,
    sessionNumber: updates.sessionNumber ?? session.sessionNumber,
    startsAt: updates.startsAt ?? session.startsAt,
    endsAt: updates.endsAt ?? session.endsAt,
    timezone: updates.timezone ?? session.timezone,
    status: updates.status ?? session.status,
    type: updates.type ?? session.type,
    location: updates.location ?? session.location,
    notes: updates.notes ?? session.notes,
    clinicalNotes: updates.clinicalNotes ?? session.clinicalNotes,
    sessionTheme: updates.sessionTheme ?? session.sessionTheme,
    sessionMotives: updates.sessionMotives ?? session.sessionMotives,
    interventions: updates.interventions ?? session.interventions,
    tags: updates.tags ?? session.tags,
    moodScale: updates.moodScale ?? session.moodScale,
    anxietyScale: updates.anxietyScale ?? session.anxietyScale,
    recurrentThemes: updates.recurrentThemes ?? session.recurrentThemes,
    rescheduledFromStartsAt: updates.rescheduledFromStartsAt ?? session.rescheduledFromStartsAt,
    rescheduledFromEndsAt: updates.rescheduledFromEndsAt ?? session.rescheduledFromEndsAt,
    syncGoogle: Boolean(session.googleEventId),
  };
}

export function SessionDetailsDialog({
  visible,
  session,
  deleting,
  onHide,
  onEdit,
  onDelete,
  onSaved,
}: SessionDetailsDialogProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SessionStatus>('scheduled');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [moodScale, setMoodScale] = useState(4);
  const [anxietyScale, setAnxietyScale] = useState(3);
  const [theme, setTheme] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleStart, setRescheduleStart] = useState('');
  const [rescheduleEnd, setRescheduleEnd] = useState('');
  const [error, setError] = useState<string | null>(null);

  const currentMeta = STATUS_META[status];
  const showCompletedFields = status === 'completed';
  const patientInitial = useMemo(
    () => session?.patientName?.trim().charAt(0).toUpperCase() || 'S',
    [session]
  );

  useEffect(() => {
    if (!visible || !session) {
      setConfirmingDelete(false);
      return;
    }

    setStatus(session.status);
    setNotes(session.notes || '');
    setTags(session.tags || []);
    setMoodScale(session.moodScale || 4);
    setAnxietyScale(session.anxietyScale || 3);
    setTheme(session.recurrentThemes || session.sessionTheme || '');
    setRescheduling(false);
    setRescheduleStart(toLocalInputValue(session.startsAt));
    setRescheduleEnd(toLocalInputValue(session.endsAt));
    setError(null);
  }, [session, visible]);

  const persist = async (updates: Partial<PatientSessionPayload>) => {
    if (!session) return;

    setSaving(true);
    setError(null);
    try {
      const saved = await saveSession(buildPayload(session, updates), session.id);
      onSaved(saved);
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar sessao.');
    } finally {
      setSaving(false);
    }
  };

  const handlePresent = () => {
    setStatus('completed');
  };

  const handleMissed = async () => {
    setStatus('missed');
    await persist({ status: 'missed', notes });
  };

  const handleReschedule = () => {
    setStatus('rescheduled');
    setRescheduling(true);
  };

  const handleSave = async () => {
    if (!session) return;

    const nextTags = [...tags];
    let startsAt = session.startsAt;
    let endsAt = session.endsAt;

    if (rescheduling) {
      startsAt = fromLocalInputValue(rescheduleStart);
      endsAt = fromLocalInputValue(rescheduleEnd);
      const tag = formatRescheduleTag(rescheduleStart);
      if (!nextTags.includes(tag)) {
        nextTags.push(tag);
      }
    }

    await persist({
      status,
      notes,
      startsAt,
      endsAt,
      tags: nextTags,
      moodScale: showCompletedFields ? moodScale : session.moodScale,
      anxietyScale: showCompletedFields ? anxietyScale : session.anxietyScale,
      recurrentThemes: showCompletedFields ? theme : session.recurrentThemes,
      rescheduledFromStartsAt: rescheduling ? session.startsAt : session.rescheduledFromStartsAt,
      rescheduledFromEndsAt: rescheduling ? session.endsAt : session.rescheduledFromEndsAt,
    });
  };

  const toggleTag = (tag: string) => {
    setTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  };

  return (
    <Dialog
      visible={visible}
      onHide={() => {
        if (!deleting && !saving) {
          onHide();
        }
      }}
      modal
      draggable={false}
      showHeader={false}
      className="mx-0 h-full w-full max-w-md sm:h-auto"
      contentClassName="h-full p-0"
    >
      {session ? (
        <div className="flex min-h-full flex-col bg-white px-7 py-5 text-left text-[#111111]">
          <div className="mb-8 flex items-center gap-3">
            <button
              type="button"
              onClick={onHide}
              disabled={saving || deleting}
              className="text-[#5A260F]"
              aria-label="Voltar"
            >
              <FiArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-[#3A1C0B]">Detalhes da sessao</h1>
          </div>

          <div className="mb-6 flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#5A260F] text-2xl font-medium text-white">
              {patientInitial}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold text-[#111111]">
                {session.patientName || 'Paciente'}
              </h2>
              <p className="mt-1 text-base text-[#111111]">{formatTimeRange(session)}</p>
            </div>
          </div>

          <div className={`mb-7 inline-flex w-fit rounded-md border px-3 py-2 text-sm ${currentMeta.chip}`}>
            <span>Status atual:&nbsp;</span>
            <span className={`font-semibold ${currentMeta.text}`}>{currentMeta.label}</span>
          </div>

          <div className="mb-6">
            <h3 className="mb-4 text-sm font-bold text-[#111111]">Acoes rapidas</h3>
            {status === 'completed' ? (
              <button
                type="button"
                className="inline-flex w-40 items-center justify-center gap-2 rounded-md border border-[#2BA64B] bg-[#E8F8EC] px-4 py-2 text-sm font-bold text-[#2BA64B]"
              >
                <FiCheck />
                Presente
              </button>
            ) : (
              <div className="grid gap-5">
                <div className="grid grid-cols-2 gap-6">
                  <button
                    type="button"
                    onClick={handlePresent}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-[#2BA64B] bg-[#E8F8EC] px-4 py-2 text-sm font-bold text-[#2BA64B]"
                  >
                    <FiCheck />
                    Presente
                  </button>
                  <button
                    type="button"
                    onClick={handleMissed}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-[#E10415] bg-[#FEE4E6] px-4 py-2 text-sm font-bold text-[#E10415]"
                  >
                    <FiX />
                    Falta
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleReschedule}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-[#9647FF] bg-[#F3ECFF] px-4 py-2 text-sm font-bold text-[#9647FF]"
                >
                  <FiRefreshCw />
                  Reagendar
                </button>
              </div>
            )}
          </div>

          {rescheduling ? (
            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-bold text-[#111111]">
                Novo inicio
                <input
                  type="datetime-local"
                  value={rescheduleStart}
                  onChange={(event) => setRescheduleStart(event.target.value)}
                  className="mt-1 w-full rounded border border-[#6A3710] px-3 py-2 text-sm font-normal"
                />
              </label>
              <label className="text-sm font-bold text-[#111111]">
                Novo fim
                <input
                  type="datetime-local"
                  value={rescheduleEnd}
                  onChange={(event) => setRescheduleEnd(event.target.value)}
                  className="mt-1 w-full rounded border border-[#6A3710] px-3 py-2 text-sm font-normal"
                />
              </label>
            </div>
          ) : null}

          <label className="mb-1 text-sm font-bold text-[#111111]">Observacoes</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mb-1 min-h-20 rounded border border-[#6A3710] px-3 py-2 text-sm"
            placeholder="Paciente costuma faltar"
          />

          <button
            type="button"
            onClick={onEdit}
            disabled={saving || deleting}
            className="mb-5 w-fit text-sm text-[#3A1C0B] underline"
          >
            Editar
          </button>

          {showCompletedFields ? (
            <>
              <h3 className="mb-2 text-sm font-bold text-[#111111]">Tags</h3>
              <div className="mb-4 flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-2 py-1 text-xs font-bold ${
                      tags.includes(tag)
                        ? 'bg-[#6A3710] text-white'
                        : 'bg-[#F5EEE8] text-[#6A3710]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <h3 className="mb-2 text-sm font-bold text-[#111111]">Escalas</h3>
              <div className="mb-4 grid gap-3">
                <div>
                  <p className="mb-2 text-xs text-[#3A1C0B]">Humor</p>
                  <div className="grid grid-cols-5 gap-9">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMoodScale(value)}
                        className={`h-8 w-8 rounded border text-sm ${
                          moodScale === value
                            ? 'border-[#2BA64B] bg-[#2BA64B] text-white'
                            : 'border-[#6A3710] bg-white text-[#3A1C0B]'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs text-[#3A1C0B]">Ansiedade</p>
                  <div className="grid grid-cols-5 gap-9">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAnxietyScale(value)}
                        className={`h-8 w-8 rounded border text-sm ${
                          anxietyScale === value
                            ? 'border-[#CDA131] bg-[#CDA131] text-white'
                            : 'border-[#6A3710] bg-white text-[#3A1C0B]'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <label className="mb-1 text-sm font-bold text-[#111111]">Temas recorrentes</label>
              <input
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
                className="mb-5 rounded border border-[#6A3710] px-3 py-2 text-sm"
                placeholder="Digitar..."
              />
            </>
          ) : null}

          {confirmingDelete ? (
            <div className="mb-4 rounded-md border border-[#B42318] bg-[#FEE4E2] p-3">
              <p className="mb-3 text-sm font-semibold text-[#3A1C0B]">
                Tem certeza que deseja excluir esta sessao?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  className="rounded-md border border-[#6A3710] px-3 py-2 text-sm font-semibold text-[#6A3710]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleting}
                  className="rounded-md bg-[#B42318] px-3 py-2 text-sm font-semibold text-white"
                >
                  {deleting ? 'Excluindo...' : 'Confirmar'}
                </button>
              </div>
            </div>
          ) : null}

          {error ? <p className="mb-3 text-sm text-[#B42318]">{error}</p> : null}

          <div className="mt-auto flex gap-3 pt-6">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || deleting}
              className="rounded-md bg-[#6A3710] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={saving || deleting}
              className="rounded-md bg-[#B42318] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Excluir sessao
            </button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
