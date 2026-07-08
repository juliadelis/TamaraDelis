import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgendaCalendar } from './components/AgendaCalendar';
import type { PatientSession } from '../../../shared/models/session.model';
import { getSessions } from '../../../shared/services/session';

function startOfMonthIso(year: number, month: number) {
  return new Date(year, month, 1, 0, 0, 0, 0).toISOString();
}

function endOfMonthIso(year: number, month: number) {
  return new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();
}

function toDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const Agenda = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      try {
        setSessions(
          await getSessions({
            from: startOfMonthIso(currentYear, currentMonth),
            to: endOfMonthIso(currentYear, currentMonth),
          })
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [currentMonth, currentYear]);

  const scheduleDays = useMemo(
    () => Array.from(new Set(sessions.map((session) => new Date(session.startsAt).getDate()))),
    [sessions]
  );
  const monthlyPatientCount = useMemo(
    () => new Set(sessions.map((session) => session.patientId)).size,
    [sessions]
  );

  const sessionLabel = sessions.length === 1 ? 'sessão' : 'sessões';
  const patientLabel = monthlyPatientCount === 1 ? 'paciente' : 'pacientes';

  const handleMonthChange = (month: number) => {
    setCurrentMonth(month);
    const updatedDate = new Date(selectedDate);
    updatedDate.setMonth(month);
    if (updatedDate.getMonth() !== month) {
      updatedDate.setDate(1);
    }
    setSelectedDate(updatedDate);
  };

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    const updatedDate = new Date(selectedDate);
    updatedDate.setFullYear(year);
    setSelectedDate(updatedDate);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    navigate(`/agenda/${toDateParam(date)}`);
  };

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-left text-3xl font-semibold text-[#502815]">Agenda</h2>
            <p className="mt-2 text-left text-[18px] text-[#502815]">
              Clique em um dia para ver os horarios de meia em meia hora.
            </p>
          </div>
          {loading ? <p className="text-sm text-[#6A3710]">Carregando...</p> : null}
        </div>

        <div className="max-w-3xl">
          <AgendaCalendar
            month={currentMonth}
            year={currentYear}
            scheduleDays={scheduleDays}
            onSelectDate={handleSelectDate}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
          />

          <div className="mt-6 space-y-3 text-left text-sm font-bold text-[#502815]">
            <p>
              {sessions.length} {sessionLabel}
            </p>
            <p>
              {monthlyPatientCount} {patientLabel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
