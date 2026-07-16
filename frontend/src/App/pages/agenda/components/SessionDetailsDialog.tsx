import { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { FiArrowLeft, FiCheck, FiRefreshCw, FiVideo, FiX } from 'react-icons/fi';
import type {
  PatientSession,
  PatientSessionPayload,
  PaymentMethod,
  PaymentStatus,
  SessionStatus,
} from '../../../../shared/models/session.model';
import type { DeleteSessionScope } from '../../../../shared/services/session';
import { saveSession } from '../../../../shared/services/session';

type SessionDetailsDialogProps = {
  visible: boolean;
  session: PatientSession | null;
  initialStatus?: SessionStatus | null;
  deleting: boolean;
  onHide: () => void;
  onEdit: () => void;
  onDelete: (scope?: DeleteSessionScope) => void;
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

function formatSessionDate(session: PatientSession) {
  const date = new Date(session.startsAt);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('pt-BR');
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

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatCurrency(value: number | null) {
  return value === null || Number.isNaN(value) ? '-' : currencyFormatter.format(value);
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
    cid: updates.cid ?? session.cid,
    sessionTheme: updates.sessionTheme ?? session.sessionTheme,
    sessionMotives: updates.sessionMotives ?? session.sessionMotives,
    interventions: updates.interventions ?? session.interventions,
    tags: updates.tags ?? session.tags,
    moodScale: updates.moodScale ?? session.moodScale,
    anxietyScale: updates.anxietyScale ?? session.anxietyScale,
    recurrentThemes: updates.recurrentThemes ?? session.recurrentThemes,
    rescheduledFromStartsAt: updates.rescheduledFromStartsAt ?? session.rescheduledFromStartsAt,
    rescheduledFromEndsAt: updates.rescheduledFromEndsAt ?? session.rescheduledFromEndsAt,
    paymentStatus: updates.paymentStatus ?? session.paymentStatus,
    paymentMethod: updates.paymentMethod ?? session.paymentMethod,
    recurrenceGroupId: updates.recurrenceGroupId ?? session.recurrenceGroupId,
    recurrenceType: updates.recurrenceType ?? session.recurrenceType,
    syncGoogle: Boolean(session.googleEventId),
  };
}

export function SessionDetailsDialog({
  visible,
  session,
  initialStatus = null,
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
  const [cid, setCid] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [moodScale, setMoodScale] = useState(4);
  const [anxietyScale, setAnxietyScale] = useState(3);
  const [theme, setTheme] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleStart, setRescheduleStart] = useState('');
  const [rescheduleEnd, setRescheduleEnd] = useState('');
  const [error, setError] = useState<string | null>(null);

  const currentMeta = STATUS_META[status];
  const showCompletedFields = status === 'completed';
  const showMissedFields = status === 'missed';
  const missedFeeAmount = session?.sessionPrice === null || session?.sessionPrice === undefined ? null : session.sessionPrice * 0.5;
  const isRecurringSession = Boolean(session?.recurrenceGroupId);
  const patientInitial = useMemo(
    () => session?.patientName?.trim().charAt(0).toUpperCase() || 'S',
    [session]
  );

  useEffect(() => {
    if (!visible || !session) {
      setConfirmingDelete(false);
      return;
    }

    const nextStatus = initialStatus || session.status;
    setStatus(nextStatus);
    setNotes(session.notes || '');
    setCid(session.cid || '');
    setTags(session.tags || []);
    setMoodScale(session.moodScale || 4);
    setAnxietyScale(session.anxietyScale || 3);
    setTheme(session.recurrentThemes || session.sessionTheme || '');
    setPaymentStatus(
      nextStatus === 'completed'
        ? session.status === 'completed'
          ? session.paymentStatus || 'paid'
          : 'paid'
        : nextStatus === 'missed'
          ? session.status === 'missed'
            ? session.paymentStatus || 'cancelled'
            : 'cancelled'
          : session.paymentStatus || 'pending'
    );
    setPaymentMethod(session.paymentMethod || 'pix');
    setRescheduling(false);
    setRescheduleStart(toLocalInputValue(session.startsAt));
    setRescheduleEnd(toLocalInputValue(session.endsAt));
    setError(null);
  }, [initialStatus, session, visible]);

  const persist = async (updates: Partial<PatientSessionPayload>) => {
    if (!session) return;

    setSaving(true);
    setError(null);
    try {
      const saved = await saveSession(buildPayload(session, updates), session.id);
      onSaved(saved);
      onHide();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar sessão.');
    } finally {
      setSaving(false);
    }
  };

  const handlePresent = () => {
    setStatus('completed');
    setPaymentStatus('paid');
    setPaymentMethod((current) => current || 'pix');
  };

  const handleMissed = () => {
    setStatus('missed');
    setPaymentStatus(session?.status === 'missed' ? session.paymentStatus || 'cancelled' : 'cancelled');
    setPaymentMethod((current) => current || 'pix');
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
      cid: showCompletedFields ? cid : session.cid,
      startsAt,
      endsAt,
      tags: nextTags,
      moodScale: showCompletedFields ? moodScale : session.moodScale,
      anxietyScale: showCompletedFields ? anxietyScale : session.anxietyScale,
      recurrentThemes: showCompletedFields ? theme : session.recurrentThemes,
      paymentStatus: showCompletedFields || showMissedFields ? paymentStatus : session.paymentStatus,
      paymentMethod: (showCompletedFields || showMissedFields) && paymentStatus === 'paid' ? paymentMethod : '',
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
            <h1 className="text-2xl font-bold text-[#3A1C0B]">Detalhes da sessão</h1>
          </div>

          <div className="mb-6 flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#5A260F] text-2xl font-medium text-white">
              {patientInitial}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold text-[#111111]">
                {session.patientName || 'Paciente'}
              </h2>
              <p className="mt-1 text-base text-[#111111]">
                {formatSessionDate(session)} - {formatTimeRange(session)}
              </p>
            </div>
          </div>

          <div className={`mb-7 inline-flex w-fit rounded-md border px-3 py-2 text-sm ${currentMeta.chip}`}>
            <span>Status atual:&nbsp;</span>
            <span className={`font-semibold ${currentMeta.text}`}>{currentMeta.label}</span>
          </div>

          {session.googleMeetLink ? (
            <a
              href={session.googleMeetLink}
              target="_blank"
              rel="noreferrer"
              className="mb-7 inline-flex w-fit items-center justify-center gap-2 rounded-md border border-[#6A3710] px-4 py-2 text-sm font-bold text-[#3A1C0B]"
            >
              <FiVideo />
              Entrar no Google Meet
            </a>
          ) : null}

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

          <label className="mb-1 text-sm font-bold text-[#111111]">Observações</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mb-1 min-h-36 resize-y rounded border border-[#6A3710] px-3 py-2 text-sm"
            placeholder="Paciente costuma faltar"
          />

          {showCompletedFields ? (
            <>
              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-bold text-[#111111]">
                  Pagamento
                  <select
                    value={paymentStatus}
                    onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus)}
                    className="mt-1 w-full rounded border border-[#6A3710] bg-white px-3 py-2 text-sm font-normal"
                  >
                    <option value="paid">Pago</option>
                    <option value="pending">Não pago</option>
                  </select>
                </label>
                <label className="text-sm font-bold text-[#111111]">
                  Metodo de pagamento
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                    disabled={paymentStatus !== 'paid'}
                    className="mt-1 w-full rounded border border-[#6A3710] bg-white px-3 py-2 text-sm font-normal disabled:bg-[#F5EEE8] disabled:text-[#8A6A4F]"
                  >
                    <option value="pix">Pix</option>
                    <option value="cash">Dinheiro</option>
                  </select>
                </label>
              </div>

              <label className="mb-1 text-sm font-bold text-[#111111]">CID</label>
              <input
                value={cid}
                onChange={(event) => setCid(event.target.value)}
                className="mb-5 rounded border border-[#6A3710] px-3 py-2 text-sm"
                placeholder="Ex: F41.1"
              />

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

              <label className="mb-1 text-sm font-bold text-[#111111]">Temas recorrentes</label>
              <input
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
                className="mb-5 rounded border border-[#6A3710] px-3 py-2 text-sm"
                placeholder="Digitar..."
              />
            </>
          ) : null}

          {showMissedFields ? (
            <div className="mb-5 rounded-md border border-[#D8C0A3] bg-[#FFF8ED] p-4">
              <h3 className="text-sm font-bold text-[#3A1C0B]">Taxa de falta</h3>
              <p className="mt-1 text-sm text-[#55422f]">
                Valor de 50% da sessao: <span className="font-semibold">{formatCurrency(missedFeeAmount)}</span>
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-bold text-[#111111]">
                  Taxa de falta
                  <select
                    value={paymentStatus}
                    onChange={(event) => {
                      const nextStatus = event.target.value as PaymentStatus;
                      setPaymentStatus(nextStatus);
                      if (nextStatus === 'paid') {
                        setPaymentMethod((current) => current || 'pix');
                      }
                    }}
                    className="mt-1 w-full rounded border border-[#6A3710] bg-white px-3 py-2 text-sm font-normal"
                  >
                    <option value="cancelled">Nao cobrar</option>
                    <option value="pending">Cobrar 50% - nao pago</option>
                    <option value="paid">Cobrar 50% - pago</option>
                  </select>
                </label>

                {paymentStatus === 'paid' ? (
                  <label className="text-sm font-bold text-[#111111]">
                    Metodo de pagamento
                    <select
                      value={paymentMethod}
                      onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                      className="mt-1 w-full rounded border border-[#6A3710] bg-white px-3 py-2 text-sm font-normal"
                    >
                      <option value="pix">Pix</option>
                      <option value="cash">Dinheiro</option>
                    </select>
                  </label>
                ) : null}
              </div>
            </div>
          ) : null}

          {confirmingDelete ? (
            <div className="mb-4 rounded-md border border-[#B42318] bg-[#FEE4E2] p-3">
              <p className="mb-3 text-sm font-semibold text-[#3A1C0B]">
                Tem certeza que deseja excluir esta sessão?
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
                {isRecurringSession ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onDelete('single')}
                      disabled={deleting}
                      className="rounded-md bg-[#B42318] px-3 py-2 text-sm font-semibold text-white"
                    >
                      {deleting ? 'Excluindo...' : 'Só essa sessão'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete('future')}
                      disabled={deleting}
                      className="rounded-md bg-[#8F1D14] px-3 py-2 text-sm font-semibold text-white"
                    >
                      Essa e as próximas
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => onDelete('single')}
                    disabled={deleting}
                    className="rounded-md bg-[#B42318] px-3 py-2 text-sm font-semibold text-white"
                  >
                    {deleting ? 'Excluindo...' : 'Confirmar'}
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {error ? <p className="mb-3 text-sm text-[#B42318]">{error}</p> : null}

          <div className="mt-auto flex gap-3 pt-6">
            <button
              type="button"
              onClick={onEdit}
              disabled={saving || deleting}
              className="rounded-md bg-[#6A3710] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Editar
            </button>
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
              Excluir sessão
            </button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
