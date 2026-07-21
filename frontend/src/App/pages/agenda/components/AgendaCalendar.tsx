import { getMonthName } from '../../../../shared/utils/dateUtils';

interface AgendaCalendarProps {
  month: number;
  year: number;
  scheduleDays: number[];
  onSelectDate: (date: Date) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export const AgendaCalendar = ({
  month,
  year,
  scheduleDays,
  onSelectDate,
  onMonthChange,
  onYearChange,
}: AgendaCalendarProps) => {
  const today = new Date();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

  const cells = Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - firstDayIndex + 1;
    const isCurrentMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
    const date = isCurrentMonth
      ? new Date(year, month, dayNumber)
      : null;

    return {
      date,
      dayNumber,
      isCurrentMonth,
    };
  });

  const yearOptions = [year - 1, year, year + 1];

  return (
    <div className="text-left">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mt-1 text-2xl font-bold text-[#502815]">
            {getMonthName(month)} {year}
          </h2>
        </div>

        <div className="flex gap-3 sm:flex-row items-start sm:items-center">
          <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#502815]">Mês</label>
          <select
            value={month}
            onChange={(event) => onMonthChange(Number(event.target.value))}
            className="rounded-lg border border-[#D9D3CE] bg-white px-3 py-2 text-sm text-[#1E1E1E] shadow-sm"
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
</div>
<div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#502815]">Ano</label>
          <select
            value={year}
            onChange={(event) => onYearChange(Number(event.target.value))}
            className="rounded-lg border border-[#D9D3CE] bg-white px-3 py-2 text-sm text-[#1E1E1E] shadow-sm"
          >
            {yearOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-sm font-semibold text-[#6A3710]">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-3">
        {cells.map((cell, index) => {
          const hasSchedule = cell.date ? scheduleDays.includes(cell.date.getDate()) : false;
          const isToday = Boolean(
            cell.date &&
              cell.date.getFullYear() === today.getFullYear() &&
              cell.date.getMonth() === today.getMonth() &&
              cell.date.getDate() === today.getDate()
          );

          return (
            <button
              key={`calendar-cell-${index}`}
              type="button"
              disabled={!cell.isCurrentMonth}
              onClick={() => cell.date && onSelectDate(cell.date)}
              aria-current={isToday ? 'date' : undefined}
              className={`h-10 rounded text-sm font-semibold transition duration-200 focus:outline-none ${
                cell.isCurrentMonth
                  ? isToday
                    ? 'bg-[#E87524] text-white shadow-sm hover:bg-[#D96517]'
                    : hasSchedule
                    ? 'bg-[#6A3710] text-white hover:bg-[#7f4d2b]'
                    : 'bg-white text-[#1E1E1E] hover:bg-[#F2E8DE]'
                  : 'bg-transparent text-transparent cursor-default'
              }`}
            >
              {cell.isCurrentMonth ? cell.dayNumber : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
};
