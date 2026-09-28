import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { GoPlusCircle } from 'react-icons/go';
import type { PatientSession, SessionStatus } from '../../../../shared/models/session.model';
import { SESSION_STATUS_LABEL } from '../../../../shared/models/session.model';
import { formatDayName, getMonthName } from '../../../../shared/utils/dateUtils';
import type { PersonalAppointment } from '../../../../shared/services/personalAppointment';

interface DayAgendaProps {
  selectedDate: Date;
  sessions: PatientSession[];
  personalAppointments: PersonalAppointment[];
  onViewPersonalAppointment: (appointment: PersonalAppointment) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onRegisterSession: (slot?: string) => void;
  onViewSession: (session: PatientSession) => void;
}

const SLOT_HEIGHT = 40;
const SLOT_MINUTES = 30;

const STATUS_STYLES: Record<SessionStatus, { card: string; accent: string; label: string }> = {
  scheduled: {
    card: 'bg-[#FFF5DD]',
    accent: 'bg-[#E8B942]',
    label: 'text-[#CDA131]',
  },
  completed: {
    card: 'bg-[#E0F5E4]',
    accent: 'bg-[#2BA64B]',
    label: 'text-[#2BA64B]',
  },
  cancelled: {
    card: 'bg-[#FEE4E6]',
    accent: 'bg-[#E10415]',
    label: 'text-[#E10415]',
  },
  missed: {
    card: 'bg-[#FEE4E6]',
    accent: 'bg-[#E10415]',
    label: 'text-[#E10415]',
  },
  rescheduled: {
    card: 'bg-[#EDE8F9]',
    accent: 'bg-[#9647FF]',
    label: 'text-[#9647FF]',
  },
};

function formatHeaderDate(date: Date) {
  return `${formatDayName(date)}, ${date.getDate()} de ${getMonthName(date.getMonth())}`;
}

function minutesFromDate(value: string) {
  const date = new Date(value);
  return date.getHours() * 60 + date.getMinutes();
}

export const DayAgenda = ({
  selectedDate,
  sessions,
  personalAppointments,
  onViewPersonalAppointment,
  onPrevDay,
  onNextDay,
  onRegisterSession,
  onViewSession,
}: DayAgendaProps) => {
  const events = [
    ...sessions.map(session => ({
      key: `session-${session.id}`,
      title: session.patientName || session.title || 'Sessão',
      label: SESSION_STATUS_LABEL[session.status],
      style: STATUS_STYLES[session.status],
      startsAt: session.startsAt,
      duration: Math.max(1, (Date.parse(session.endsAt) - Date.parse(session.startsAt)) / 60000),
      onView: () => onViewSession(session),
    })),
    ...personalAppointments.map(appointment => ({
      key: `personal-${appointment.id}`,
      title: appointment.name,
      label: 'Agenda pessoal',
      style: { card: 'bg-blue-100', accent: 'bg-blue-600', label: 'text-blue-700' },
      startsAt: appointment.starts_at,
      duration: appointment.duration_minutes,
      onView: () => onViewPersonalAppointment(appointment),
    })),
  ];
  const firstSlotMinutes = Math.floor(Math.min(360, ...events.map(event => minutesFromDate(event.startsAt))) / SLOT_MINUTES) * SLOT_MINUTES;
  const endMinutes = Math.min(1440, Math.max(1350, ...events.map(event => minutesFromDate(event.startsAt) + event.duration)));
  const timeSlots = Array.from({ length: Math.ceil((endMinutes - firstSlotMinutes) / SLOT_MINUTES) }, (_, index) => {
    const minutes = firstSlotMinutes + index * SLOT_MINUTES;
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  });
  const positionedEvents = events
    .map((event) => {
      const startMinutes = minutesFromDate(event.startsAt);
      const startIndex = Math.floor((startMinutes - firstSlotMinutes) / SLOT_MINUTES);
      const span = Math.max(1, Math.ceil((Math.min(startMinutes + event.duration, 1440) - firstSlotMinutes) / SLOT_MINUTES) - startIndex);

      return {
        event,
        startIndex,
        span,
        column: 0,
        columns: 1,
      };
    })
    .sort((a, b) => a.startIndex - b.startIndex || b.span - a.span);

  // Share the available width between events in each overlapping group.
  let group: typeof positionedEvents = [];
  let groupEnd = -1;
  let columnEnds: number[] = [];
  const finishGroup = () => {
    group.forEach(item => { item.columns = columnEnds.length; });
  };
  positionedEvents.forEach(item => {
    if (item.startIndex >= groupEnd) {
      finishGroup();
      group = [];
      columnEnds = [];
    }
    const available = columnEnds.findIndex(end => end <= item.startIndex);
    item.column = available === -1 ? columnEnds.length : available;
    columnEnds[item.column] = item.startIndex + item.span;
    group.push(item);
    groupEnd = Math.max(...columnEnds);
  });
  finishGroup();

  const occupiedSlots = new Set<number>();
  positionedEvents.forEach((item) => {
    for (let index = item.startIndex; index < item.startIndex + item.span; index += 1) {
      occupiedSlots.add(index);
    }
  });

  return (
    <section className="pb-7 pt-4 text-left ">
     <button
        type="button"
        onClick={() => onRegisterSession()}
        className="mb-7 inline-flex items-center gap-2 rounded-md bg-[#6A3710] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#502815]"
      >
        <GoPlusCircle size={16} />
        Registrar sessão
      </button>
     
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPrevDay}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-[#5A260F] transition hover:text-[#7B3F16]"
          aria-label="Dia anterior"
        >
          <FiArrowLeft size={24} />
        </button>

        <h2 className="min-w-0 flex-1 truncate text-xl font-bold text-[#3A1C0B] sm:text-2xl">
          {formatHeaderDate(selectedDate)}
        </h2>

        <button
          type="button"
          onClick={onNextDay}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-[#5A260F] transition hover:text-[#7B3F16]"
          aria-label="Proximo dia"
        >
          <FiArrowRight size={24} />
        </button>

        
      </div>

      <div className="relative">
        <div className="absolute bottom-0 left-[56px] top-0 w-px bg-[#D9874D]" />

        <div className="grid" style={{ gridTemplateRows: `repeat(${timeSlots.length}, ${SLOT_HEIGHT}px)` }}>
          {timeSlots.map((slot, index) => (
            <div key={slot} className="relative grid grid-cols-[52px_1fr] gap-2">
              <div className="pr-2 text-right text-[17px] font-bold leading-[28px] text-[#111111]">
                {slot}
              </div>

              <div className="min-w-0 pl-2">
                {!occupiedSlots.has(index) ? (
                  <button
                    type="button"
                    onClick={() => onRegisterSession(slot)}
                    className="h-6 w-full rounded-md border border-[#B95B24] bg-white transition hover:bg-[#FFF8ED]"
                    aria-label={`Adicionar sessao as ${slot}`}
                  />
                ) : (
                  <div className="h-6" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          className="pointer-events-none absolute left-[62px] right-0 top-0"
          style={{ height: timeSlots.length * SLOT_HEIGHT }}
        >
          {positionedEvents.map(({ event, startIndex, span, column, columns }) => {
            const style = event.style;
            const top = startIndex * SLOT_HEIGHT;
            const height = span * SLOT_HEIGHT - 8;

            return (
              <button
                key={event.key}
                type="button"
                onClick={event.onView}
                className={`pointer-events-auto absolute overflow-hidden rounded-md px-4 py-1 text-left transition hover:brightness-[0.98] focus-visible:outline-2 focus-visible:outline-blue-700 ${style.card}`}
                style={{ top, height, left: `calc(${column * 100 / columns}% + 8px)`, width: `calc(${100 / columns}% - 8px)` }}
                aria-label={`Ver detalhes de ${event.title}, ${event.label}`}
                title={`${event.title} · ${event.label} · ${event.duration} minutos`}
              >
                <div className={`absolute bottom-2 left-2 top-2 w-[3px] rounded-full ${style.accent}`} />
                <h2 className="truncate text-[17px] font-bold leading-tight text-[#111111]">
                  {event.title}
                </h2>
                <p className={`text-sm font-bold leading-tight ${style.label}`}>
                  {event.label}
                </p>
                <span className="text-xs font-medium leading-tight text-[#3A1C0B] underline">
                  Ver detalhes
                </span>
              </button>
            );
          })}
        </div>
      </div>

      
    </section>
  );
};
