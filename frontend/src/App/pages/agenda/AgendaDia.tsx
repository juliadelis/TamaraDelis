import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { DayAgenda } from './components/DayAgenda';
import { SessionDetailsDialog } from './components/SessionDetailsDialog';
import type { PatientSession } from '../../../shared/models/session.model';
import type { PatientRecord } from '../../../shared/models/patient.model';
import { deleteSession, getSessions } from '../../../shared/services/session';
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
  const { date } = useParams();
  const navigate = useNavigate();
  const selectedDate = useMemo(() => parseDateParam(date), [date]);
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PatientSession | null>(null);
  const [editingSession, setEditingSession] = useState<PatientSession | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    setSelectedSession(null);
    setDialogVisible(true);
  };

  const handleDeleteSession = async () => {
    if (!selectedSession) return;

    setDeleting(true);
    try {
      await deleteSession(selectedSession.id, Boolean(selectedSession.googleEventId));
      setSessions((current) => current.filter((item) => item.id !== selectedSession.id));
      setSelectedSession(null);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="flex"> <button
        type="button"
        onClick={() => navigate('/agenda')}
        className="mb-4 inline-flex items-center gap-2 rounded-md border border-[#6A3710] bg-white px-3 py-2 text-sm font-semibold text-[#3A1C0B] shadow-sm transition hover:bg-[#F5EEE8]"
      >
        <FiArrowLeft />
        Voltar para agenda
      </button></div>
    
      <div className="relative">
        {loading ? (
          <p className="absolute right-4 top-14 z-10 text-xs font-semibold text-[#6A3710]">
            Carregando...
          </p>
        ) : null}
        <DayAgenda
          selectedDate={selectedDate}
          sessions={sessions}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          onRegisterSession={() => {
            setEditingSession(null);
            setDialogVisible(true);
          }}
          onViewSession={setSelectedSession}
        />
        {dialogVisible ? (
          <SessionFormDialog
            visible={dialogVisible}
            patients={patients}
            defaultDate={selectedDate}
            session={editingSession}
            blankInitialTitle={!editingSession}
            onHide={() => setDialogVisible(false)}
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
