import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { EXPENSE_CATEGORIES } from '../../../shared/services/personalFinance';
import { PersonalAppointmentFormDialog } from './components/PersonalAppointmentFormDialog';
import { deletePersonalAppointment, getPersonalAppointments, type PersonalAppointment, type PersonalDeleteScope } from '../../../shared/services/personalAppointment';
import { FiArrowLeft } from 'react-icons/fi';
import { DayAgenda } from './components/DayAgenda';
import { SessionDetailsDialog } from './components/SessionDetailsDialog';
import type { PatientSession } from '../../../shared/models/session.model';
import type { PatientRecord } from '../../../shared/models/patient.model';
import { deleteSession, getSessions, type DeleteSessionScope } from '../../../shared/services/session';
import { getPatientRecord } from '../../../shared/services/patient';
import { SessionFormDialog } from '../paciente/components/SessionFormDialog';

function parseDateParam(value = '') {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (!year || !month || !day || Number.isNaN(date.getTime())) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

function toDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfDayIso(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).toISOString();
}

function endOfDayIso(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).toISOString();
}

export function AgendaDia() {
  const location = useLocation();
  const { date } = useParams();
  const navigate = useNavigate();
  const selectedDate = useMemo(() => parseDateParam(date), [date]);
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [defaultSessionStart, setDefaultSessionStart] = useState<Date | null>(null);
  const [selectedSession, setSelectedSession] = useState<PatientSession | null>(null);
  const [editingSession, setEditingSession] = useState<PatientSession | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [choosingAgenda, setChoosingAgenda] = useState(Boolean(location.state?.registerAppointment));
  const [personalFormVisible, setPersonalFormVisible] = useState(false);
  const [personalAppointments, setPersonalAppointments] = useState<PersonalAppointment[]>([]);
  const [personalError, setPersonalError] = useState('');
  const [personalLoading, setPersonalLoading] = useState(false);
  const [selectedPersonalAppointment, setSelectedPersonalAppointment] = useState<PersonalAppointment | null>(null);
  const [editingPersonalAppointment, setEditingPersonalAppointment] = useState<PersonalAppointment | null>(null);
  const [deletingPersonal, setDeletingPersonal] = useState(false);
  const [personalDeleteVisible, setPersonalDeleteVisible] = useState(false);
  const [personalDeleteScope, setPersonalDeleteScope] = useState<PersonalDeleteScope>('single');
  const [personalActionError, setPersonalActionError] = useState('');

  const handleDeletePersonalAppointment = async () => {
    if (!selectedPersonalAppointment || deletingPersonal) return;
    setPersonalActionError('');
    setDeletingPersonal(true);
    try {
      const deletedIds = new Set(await deletePersonalAppointment(selectedPersonalAppointment.id, personalDeleteScope));
      setPersonalAppointments(current => current.filter(item => !deletedIds.has(item.id)));
      setPersonalDeleteVisible(false);
      setSelectedPersonalAppointment(null);
    } catch (error) {
      setPersonalActionError(error instanceof Error ? error.message : 'Não foi possível excluir o compromisso.');
    } finally {
      setDeletingPersonal(false);
    }
  };

  useEffect(() => {
    if (location.state?.registerAppointment) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setPersonalLoading(true);
      setPersonalAppointments([]);
      setPersonalError('');
      try {
        const data = await getPersonalAppointments({ from: startOfDayIso(selectedDate), to: endOfDayIso(selectedDate) });
        if (active) setPersonalAppointments(data);
      } catch (error) {
        if (active) setPersonalError(error instanceof Error ? error.message : 'Não foi possível carregar a agenda pessoal.');
      } finally {
        if (active) setPersonalLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [selectedDate]);

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      try {
        const data = await getSessions({
          from: startOfDayIso(selectedDate),
          to: endOfDayIso(selectedDate),
        });
        setSessions(
          data.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [selectedDate]);

  useEffect(() => {
    const loadPatients = async () => {
      setPatientsLoading(true);
      try {
        setPatients(await getPatientRecord());
      } catch (error) {
        console.error(error);
      } finally {
        setPatientsLoading(false);
      }
    };

    loadPatients();
  }, []);

  const handlePrevDay = () => {
    const previous = new Date(selectedDate);
    previous.setDate(previous.getDate() - 1);
    navigate(`/agenda/${toDateParam(previous)}`);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    navigate(`/agenda/${toDateParam(next)}`);
  };

  const handleSessionSaved = (session: PatientSession) => {
    setDialogVisible(false);
    setEditingSession(null);
    setDefaultSessionStart(null);
    upsertSessionInDay(session);
  };

  const upsertSessionInDay = (session: PatientSession) => {
    const sessionDate = new Date(session.startsAt);
    const sameDay =
      sessionDate.getFullYear() === selectedDate.getFullYear() &&
      sessionDate.getMonth() === selectedDate.getMonth() &&
      sessionDate.getDate() === selectedDate.getDate();

    setSessions((current) => {
      const withoutSaved = current.filter((item) => item.id !== session.id);
      const next = sameDay ? [...withoutSaved, session] : withoutSaved;

      return next.sort(
        (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      );
    });
  };

  const handleQuickSessionSaved = (session: PatientSession) => {
    upsertSessionInDay(session);
    setSelectedSession(null);
  };

  const handleEditSession = () => {
    if (!selectedSession) return;
    setEditingSession(selectedSession);
    setDefaultSessionStart(null);
    setSelectedSession(null);
    setDialogVisible(true);
  };

  const handleRegisterSession = (slot?: string) => {
    setEditingSession(null);

    if (slot) {
      const [hour, minutes] = slot.split(':').map(Number);
      const start = new Date(selectedDate);
      start.setHours(hour, minutes, 0, 0);
      setDefaultSessionStart(start);
    } else {
      setDefaultSessionStart(null);
    }

    setChoosingAgenda(true);
  };

  const handleDeleteSession = async (scope: DeleteSessionScope = 'single') => {
    if (!selectedSession) return;

    setDeleting(true);
    try {
      await deleteSession(selectedSession.id, Boolean(selectedSession.googleEventId), scope);
      setSessions((current) => current.filter((item) => item.id !== selectedSession.id));
      setSelectedSession(null);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-full">
      <div className="flex"> <button
        type="button"
        onClick={() => navigate('/agenda')}
        className="mb-4 inline-flex items-center gap-2 rounded-md border border-[#6A3710] bg-white px-3 py-2 text-sm font-semibold text-[#3A1C0B] shadow-sm transition hover:bg-[#F5EEE8]"
      >
        <FiArrowLeft />
        Voltar para agenda
      </button></div>
    
      <div className="relative">
        {personalLoading && <p className="text-sm text-[#6A3710]">Carregando agenda pessoal...</p>}
        {personalError && <p role="alert" className="text-red-700">{personalError}</p>}
        <Dialog header="Excluir compromisso pessoal" visible={personalDeleteVisible} onHide={() => { if (!deletingPersonal) setPersonalDeleteVisible(false); }} closable={!deletingPersonal} closeOnEscape={!deletingPersonal} modal style={{ width: '32rem', maxWidth: '95vw' }}>
          <p className="mb-4 break-words">{selectedPersonalAppointment?.name}</p>
          {selectedPersonalAppointment?.recurrence_group_id ? <fieldset disabled={deletingPersonal} className="space-y-3">
            <legend className="mb-3 font-semibold">Quais eventos deseja excluir?</legend>
            {([
              ['single', 'Somente este evento'],
              ['all', 'Todas as repetições'],
              ['future', 'Este evento e todas as repetições seguintes'],
            ] as const).map(([value, label]) => <label key={value} className="flex items-center gap-2">
              <input type="radio" name="personal-delete-scope" value={value} checked={personalDeleteScope === value} onChange={() => setPersonalDeleteScope(value)} />{label}
            </label>)}
            {personalDeleteScope === 'future' && <p className="text-sm">Os compromissos anteriores a este evento serão mantidos.</p>}
          </fieldset> : <p>Deseja excluir este compromisso?</p>}
          <p className="mt-4 text-sm">As despesas vinculadas aos eventos excluídos também serão removidas.</p>
          {personalActionError && <p role="alert" className="mt-3 text-red-700">{personalActionError}</p>}
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" disabled={deletingPersonal} onClick={() => setPersonalDeleteVisible(false)}>Cancelar</button>
            <button type="button" disabled={deletingPersonal} onClick={handleDeletePersonalAppointment} className="rounded-md bg-red-700 px-4 py-2 text-white disabled:opacity-50">{deletingPersonal ? 'Excluindo...' : 'Confirmar exclusão'}</button>
          </div>
        </Dialog>
        <Dialog header="Compromisso pessoal" visible={Boolean(selectedPersonalAppointment)} onHide={() => { if (!deletingPersonal) setSelectedPersonalAppointment(null); }} closable={!deletingPersonal} closeOnEscape={!deletingPersonal} modal style={{ width: '32rem', maxWidth: '95vw' }}>
          {selectedPersonalAppointment && <div className="space-y-3 rounded-lg bg-blue-50 p-4 text-left text-blue-950">
            <h3 className="break-words text-lg font-semibold">{selectedPersonalAppointment.name}</h3>
            <p>{new Date(selectedPersonalAppointment.starts_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
            <p>Duração: {selectedPersonalAppointment.duration_minutes} minutos</p>
            <p className="whitespace-pre-wrap break-words">{selectedPersonalAppointment.notes || 'Sem observação.'}</p>
            {selectedPersonalAppointment.expense && <section aria-label="Detalhes financeiros" className="rounded-lg border border-blue-200 bg-white p-3">
              <h4 className="font-semibold">Detalhes financeiros</h4>
              <dl className="mt-2 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-sm">Valor da despesa</dt>
                  <dd className="font-semibold">{Number(selectedPersonalAppointment.expense.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</dd>
                </div>
                <div>
                  <dt className="text-sm">Categoria</dt>
                  <dd className="font-semibold">{EXPENSE_CATEGORIES.find(([value]) => value === selectedPersonalAppointment.expense?.category)?.[1] || selectedPersonalAppointment.expense.category}</dd>
                </div>
              </dl>
            </section>}
            {selectedPersonalAppointment.expense && <p className="text-sm">Ao excluir este compromisso, a despesa vinculada também será excluída.</p>}
            {personalActionError && <p role="alert" className="text-red-700">{personalActionError}</p>}
            <div className="flex flex-wrap justify-end gap-3 pt-3">
              <button type="button" disabled={deletingPersonal} className="rounded-md border border-red-700 px-4 py-2 text-red-700 disabled:opacity-50" onClick={() => { setPersonalDeleteScope('single'); setPersonalActionError(''); setPersonalDeleteVisible(true); }}>
                {deletingPersonal ? 'Excluindo...' : 'Excluir compromisso'}
              </button>
              <button type="button" disabled={deletingPersonal} className="rounded-md bg-blue-700 px-4 py-2 text-white disabled:opacity-50" onClick={() => {
                setEditingPersonalAppointment(selectedPersonalAppointment);
                setSelectedPersonalAppointment(null);
                setPersonalFormVisible(true);
              }}>Editar compromisso</button>
            </div>
          </div>}
        </Dialog>
        <Dialog header="Escolha a agenda" visible={choosingAgenda} onHide={() => setChoosingAgenda(false)} modal style={{ width: '30rem', maxWidth: '95vw' }}>
          <div className="grid gap-3">
            <button type="button" className="rounded-lg border border-[#6A3710] p-4 text-left text-[#502815] hover:bg-[#F5EEE8]" onClick={() => { setChoosingAgenda(false); setDialogVisible(true); }}>
              <span className="block font-semibold">Agenda profissional</span>
              <span className="text-sm">Registrar sessão com paciente</span>
            </button>
            <button type="button" className="rounded-lg border border-[#6A3710] p-4 text-left text-[#502815] hover:bg-[#F5EEE8]" onClick={() => { setChoosingAgenda(false); setPersonalFormVisible(true); }}>
              <span className="block font-semibold">Agenda pessoal</span>
              <span className="text-sm">Registrar compromisso pessoal</span>
            </button>
          </div>
        </Dialog>
        {personalFormVisible && <PersonalAppointmentFormDialog
          appointment={editingPersonalAppointment}
          defaultStart={defaultSessionStart || new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 8)}
          onHide={() => { setPersonalFormVisible(false); setEditingPersonalAppointment(null); }}
          onSaved={appointment => {
            setPersonalFormVisible(false);
            setEditingPersonalAppointment(null);
            setPersonalAppointments(current => current.filter(item => item.id !== appointment.id));
            const savedDate = new Date(appointment.starts_at);
            if (toDateParam(savedDate) !== toDateParam(selectedDate)) {
              navigate(`/agenda/${toDateParam(savedDate)}`);
            } else {
              setPersonalAppointments(current => [...current.filter(item => item.id !== appointment.id), appointment].sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at)));
            }
          }}
        />}
        {loading ? (
          <p className="absolute right-4 top-14 z-10 text-xs font-semibold text-[#6A3710]">
            Carregando...
          </p>
        ) : null}
        <DayAgenda
          selectedDate={selectedDate}
          sessions={sessions}
          personalAppointments={personalAppointments}
          onViewPersonalAppointment={appointment => { setPersonalActionError(''); setSelectedPersonalAppointment(appointment); }}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          onRegisterSession={handleRegisterSession}
          onViewSession={setSelectedSession}
        />
        {dialogVisible ? (
          <SessionFormDialog
            visible={dialogVisible}
            patients={patients}
            defaultDate={selectedDate}
            defaultStartAt={defaultSessionStart || undefined}
            defaultDurationMinutes={50}
            session={editingSession}
            blankInitialTitle={!editingSession}
            onHide={() => {
              setDialogVisible(false);
              setDefaultSessionStart(null);
            }}
            onSaved={handleSessionSaved}
          />
        ) : null}
        <SessionDetailsDialog
          visible={Boolean(selectedSession)}
          session={selectedSession}
          deleting={deleting}
          onHide={() => setSelectedSession(null)}
          onEdit={handleEditSession}
          onDelete={handleDeleteSession}
          onSaved={handleQuickSessionSaved}
        />
        {patientsLoading ? (
          <p className="mt-3 text-center text-xs text-[#6A3710]">Carregando pacientes...</p>
        ) : null}
      </div>
    </div>
  );
}
