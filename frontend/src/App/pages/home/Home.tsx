import { useCallback, useEffect, useState } from 'react';
import { Calendar } from './components/Calendar';
import { DailySchedule } from './components/DailySchedule';
import { SessionDetailsDialog } from '../agenda/components/SessionDetailsDialog';
import { SessionFormDialog } from '../paciente/components/SessionFormDialog';
import { getPatientRecord } from '../../../shared/services/patient';
import { deleteSession, getSessions } from '../../../shared/services/session';
import type { Patient, PatientRecord } from '../../../shared/models/patient.model';
import type { PatientSession, SessionStatus } from '../../../shared/models/session.model';

function startOfDayIso(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).toISOString();
}

function endOfDayIso(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).toISOString();
}

function startOfWeekIso(date: Date) {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  return startOfDayIso(weekStart);
}

function endOfWeekIso(date: Date) {
  const weekEnd = new Date(date);
  weekEnd.setDate(date.getDate() + (6 - date.getDay()));
  return endOfDayIso(weekEnd);
}

function dateKey(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const SESSION_TO_PATIENT_STATUS: Record<SessionStatus, Patient['status']> = {
  scheduled: 'pending',
  completed: 'present',
  cancelled: 'absent',
  missed: 'absent',
  rescheduled: 'rescheduled',
};

function sessionToPatient(session: PatientSession): Patient {
  return {
    id: session.id,
    name: session.patientName || session.title || 'Paciente',
    time: formatTime(session.startsAt),
    status: SESSION_TO_PATIENT_STATUS[session.status],
    details: 'Ver detalhes',
  };
}

export const Home = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [daySessions, setDaySessions] = useState<PatientSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<PatientSession | null>(null);
  const [editingSession, setEditingSession] = useState<PatientSession | null>(null);
  const [detailsInitialStatus, setDetailsInitialStatus] = useState<SessionStatus | null>(null);
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadSchedule = useCallback(async () => {
    setLoadingSchedule(true);
    setScheduleError('');

    try {
      const sessions = await getSessions({
        from: startOfWeekIso(selectedDate),
        to: endOfWeekIso(selectedDate),
      });

      const selectedDateKey = dateKey(selectedDate);
      const sessionsForDay = sessions
        .filter((session) => dateKey(session.startsAt) === selectedDateKey)
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

      setDaySessions(sessionsForDay);
      setPatients(sessionsForDay.map(sessionToPatient));
      setSelectedSession((current) =>
        current ? sessionsForDay.find((session) => session.id === current.id) || null : null
      );
    } catch (error: any) {
      console.error(error);
      setDaySessions([]);
      setPatients([]);
      setSelectedSession(null);
      setScheduleError(error?.message || 'Falha ao carregar agenda.');
    } finally {
      setLoadingSchedule(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setPatientRecords(await getPatientRecord());
      } catch (error) {
        console.error(error);
      }
    };

    loadPatients();
  }, []);

  const handleSelectDate = useCallback((date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    setSelectedDate(newDate);
  }, []);

  const handleViewDetails = (patientId: string) => {
    const session = daySessions.find((item) => item.id === patientId);
    if (session) {
      setDetailsInitialStatus(null);
      setSelectedSession(session);
    }
  };

  const openDetailsWithStatus = (patientId: string, nextStatus: SessionStatus) => {
    const session = daySessions.find((item) => item.id === patientId);
    if (session) {
      setDetailsInitialStatus(nextStatus);
      setSelectedSession(session);
    }
  };

  const handleSessionSaved = (session: PatientSession) => {
    const sessionDateKey = dateKey(session.startsAt);
    const selectedDateKey = dateKey(selectedDate);

    setDaySessions((current) => {
      const withoutSaved = current.filter((item) => item.id !== session.id);
      const next = sessionDateKey === selectedDateKey ? [...withoutSaved, session] : withoutSaved;
      return next.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    });
    setPatients((current) => {
      const withoutSaved = current.filter((item) => item.id !== session.id);
      const next = sessionDateKey === selectedDateKey ? [...withoutSaved, sessionToPatient(session)] : withoutSaved;
      return next.sort((a, b) => a.time.localeCompare(b.time));
    });
    setDetailsInitialStatus(null);
    setSelectedSession(sessionDateKey === selectedDateKey ? session : null);
  };

  const handleDeleteSession = async () => {
    if (!selectedSession) return;

    setDeleting(true);
    try {
      const deletedSessionId = selectedSession.id;
      await deleteSession(deletedSessionId, Boolean(selectedSession.googleEventId));
      setDetailsInitialStatus(null);
      setSelectedSession(null);
      setDaySessions((current) => current.filter((item) => item.id !== deletedSessionId));
      setPatients((current) => current.filter((item) => item.id !== deletedSessionId));
      await loadSchedule();
    } catch (error) {
      console.error(error);
      setScheduleError(error instanceof Error ? error.message : 'Falha ao excluir sessão.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSession = () => {
    if (!selectedSession) return;

    setEditingSession(selectedSession);
    setDetailsInitialStatus(null);
    setSelectedSession(null);
  };

  const handleEditingSaved = (session: PatientSession) => {
    setEditingSession(null);
    handleSessionSaved(session);
  };

  return (
    <div className="py-2">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl text-left font-semibold text-[#502815]">
            Bem vinda, Tamara
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Calendar selectedDate={selectedDate} onSelectDate={handleSelectDate} />
          </div>

          <div className="lg:col-span-2">
            <DailySchedule
              patients={patients}
              selectedDate={selectedDate}
              loading={loadingSchedule}
              error={scheduleError}
              onViewDetails={handleViewDetails}
              onMarkPresent={(patientId) => openDetailsWithStatus(patientId, 'completed')}
              onMarkMissed={(patientId) => openDetailsWithStatus(patientId, 'missed')}
            />
          </div>
        </div>
      </div>
      <SessionDetailsDialog
        visible={Boolean(selectedSession)}
        session={selectedSession}
        initialStatus={detailsInitialStatus}
        deleting={deleting}
        onHide={() => {
          setDetailsInitialStatus(null);
          setSelectedSession(null);
        }}
        onEdit={handleEditSession}
        onDelete={handleDeleteSession}
        onSaved={handleSessionSaved}
      />
      {editingSession ? (
        <SessionFormDialog
          visible={Boolean(editingSession)}
          patients={patientRecords}
          session={editingSession}
          defaultDate={selectedDate}
          onHide={() => setEditingSession(null)}
          onSaved={handleEditingSaved}
        />
      ) : null}
    </div>
  );
};
