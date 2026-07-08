import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { GoPlusCircle } from 'react-icons/go';
import type { PatientSession, SessionStatus } from '../../../../shared/models/session.model';
import { SESSION_STATUS_LABEL } from '../../../../shared/models/session.model';
import { formatDayName, getMonthName } from '../../../../shared/utils/dateUtils';

interface DayAgendaProps {
  selectedDate: Date;
  sessions: PatientSession[];
  onPrevDay: () => void;
  onNextDay: () => void;
  onRegisterSession: (slot?: string) => void;
  onViewSession: (session: PatientSession) => void;
}

const TIME_SLOTS = Array.from({ length: 33 }, (_, index) => {
  const hour = 6 + Math.floor(index / 2);
  const minutes = index % 2 === 0 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${minutes}`;
});

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

function minutesFromSlot(slot: string) {
  const [hour, minutes] = slot.split(':').map(Number);
  return hour * 60 + minutes;
}

export const DayAgenda = ({
  selectedDate,
  sessions,
  onPrevDay,
  onNextDay,
  onRegisterSession,
  onViewSession,
}: DayAgendaProps) => {
  const firstSlotMinutes = minutesFromSlot(TIME_SLOTS[0]);
  const lastSlotMinutes = minutesFromSlot(TIME_SLOTS[TIME_SLOTS.length - 1]);
  const positionedSessions = sessions
    .map((session) => {
      const startMinutes = minutesFromDate(session.startsAt);
      const endMinutes = minutesFromDate(session.endsAt);
      const startIndex = Math.floor((startMinutes - firstSlotMinutes) / SLOT_MINUTES);
      const duration = Math.max(endMinutes - startMinutes, SLOT_MINUTES);
      const span = Math.max(1, Math.ceil(duration / SLOT_MINUTES));

      return {
        session,
        startIndex,
        span,
      };
    })
    .filter((item) => item.startIndex >= 0 && firstSlotMinutes + item.startIndex * SLOT_MINUTES <= lastSlotMinutes);

  const occupiedSlots = new Set<number>();
  positionedSessions.forEach((item) => {
    for (let index = item.startIndex; index < item.startIndex + item.span; index += 1) {
      occupiedSlots.add(index);
    }
  });

  return (
    <section className=" px-3 pb-7 pt-4 text-left sm:px-5">
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPrevDay}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-[#5A260F] transition hover:text-[#7B3F16]"
          aria-label="Dia anterior"
        >
          <FiArrowLeft size={24} />
        </button>

        <h1 className="min-w-0 flex-1 truncate text-xl font-bold text-[#3A1C0B] sm:text-2xl">
          {formatHeaderDate(selectedDate)}
        </h1>

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

        <div className="grid" style={{ gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${SLOT_HEIGHT}px)` }}>
          {TIME_SLOTS.map((slot, index) => (
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
          style={{ height: TIME_SLOTS.length * SLOT_HEIGHT }}
        >
          {positionedSessions.map(({ session, startIndex, span }) => {
            const style = STATUS_STYLES[session.status];
            const top = startIndex * SLOT_HEIGHT;
            const height = span * SLOT_HEIGHT - 8;

            return (
              <button
                key={session.id}
                type="button"
                onClick={() => onViewSession(session)}
                className={`pointer-events-auto absolute left-2 right-0 overflow-hidden rounded-md px-6 py-2 text-left transition hover:brightness-[0.98] focus:outline-none   ${style.card}`}
                style={{ top, height }}
                aria-label={`Ver detalhes de ${session.patientName || session.title || 'sessao'}`}
              >
                <div className={`absolute bottom-2 left-2 top-2 w-[3px] rounded-full ${style.accent}`} />
                <h2 className="truncate text-[17px] font-bold leading-tight text-[#111111]">
                  {session.patientName || session.title || 'Sessão'}
                </h2>
                <p className={`text-sm font-bold leading-tight ${style.label}`}>
                  {SESSION_STATUS_LABEL[session.status]}
                </p>
                <span className="text-xs font-medium leading-tight text-[#3A1C0B] underline">
                  Ver detalhes
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRegisterSession()}
        className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#6A3710] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#502815]"
      >
        <GoPlusCircle size={16} />
        Registrar sessão
      </button>
    </section>
  );
};
