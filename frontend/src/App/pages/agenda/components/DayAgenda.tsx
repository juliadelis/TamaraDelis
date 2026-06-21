import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { Patient } from '../../../../shared/models/types';
import { formatDayName, formatDateLong } from '../../../../shared/utils/dateUtils';

interface DayAgendaProps {
  selectedDate: Date;
  patients: Patient[];
  onPrevDay: () => void;
  onNextDay: () => void;
}

const TIME_SLOTS = Array.from({ length: 21 }, (_, index) => {
  const hour = 8 + Math.floor(index / 2);
  const minutes = index % 2 === 0 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${minutes}`;
});

export const DayAgenda = ({ selectedDate, patients, onPrevDay, onNextDay }: DayAgendaProps) => {
  const patientByTime = Object.fromEntries(patients.map((patient) => [patient.time, patient]));

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#6A3710]">Detalhes do dia</p>
          <h2 className="mt-2 text-3xl font-bold text-[#502815]">
            {formatDayName(selectedDate)}, {formatDateLong(selectedDate)}
          </h2>
          <p className="mt-2 text-sm text-[#6A3710]">
            {patients.length} sessão{patients.length === 1 ? '' : 'es'} agendada{patients.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPrevDay}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D9D3CE] bg-[#F9F0E6] text-[#6A3710] transition hover:bg-[#ead9c8]"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={onNextDay}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D9D3CE] bg-[#F9F0E6] text-[#6A3710] transition hover:bg-[#ead9c8]"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {TIME_SLOTS.map((slot) => {
          const appointment = patientByTime[slot];
          return (
            <div
              key={slot}
              className="grid grid-cols-[88px_1fr] gap-3 rounded-3xl border border-[#E8DDD1] bg-[#FCF7EF] p-4"
            >
              <div className="text-sm font-semibold text-[#6A3710]">{slot}</div>
              {appointment ? (
                <div className="rounded-3xl bg-[#FFF8F0] p-4 shadow-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-[#502815]">{appointment.name}</span>
                    <span className="text-sm text-[#6A3710]">{appointment.status === 'present' ? 'Presente' : appointment.status === 'absent' ? 'Falta' : appointment.status === 'rescheduled' ? 'Reagendado' : 'Pendente'}</span>
                    {appointment.details && <span className="mt-2 text-xs text-[#7F6B57]">{appointment.details}</span>}
                  </div>
                </div>
              ) : (
                <div className="h-16 rounded-3xl border border-dashed border-[#D9D3CE] bg-white" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
