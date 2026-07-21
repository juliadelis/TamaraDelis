import { useMemo } from 'react';
import { getWeekDays } from '../../../../shared/utils/dateUtils';


interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const Calendar = ({ selectedDate, onSelectDate }: CalendarProps) => {
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const today = new Date();

  const isToday = (day: Date) =>
    day.getFullYear() === today.getFullYear() &&
    day.getMonth() === today.getMonth() &&
    day.getDate() === today.getDate();

  const selectedDayIndex = weekDays.findIndex(
    (day) => day.getTime() === selectedDate.getTime()
  );

  return (
    <div className="bg-[#F9F0E6]  rounded px-3 shadow-sm">
      <div className="grid grid-cols-7 gap-2">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((letter, index) => {
          const isSelectedLetter = index === selectedDayIndex;
          const isTodayLetter = isToday(weekDays[index]);

          return (
            <div
              key={index}
              className={`text-center font-semibold text-[16px] rounded-t-md  pt-2 -mb-px ${
                isSelectedLetter || isTodayLetter ? 'text-white' : 'text-[#1E1E1E]'
              }`}
              style={
                isTodayLetter
                  ? { backgroundColor: '#E87524' }
                  : isSelectedLetter
                    ? { backgroundColor: '#502815' }
                    : undefined
              }
            >
              {letter}
            </div>
          );
        })}
      </div>

     
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dayOfMonth = day.getDate();
          const isSelected = index === selectedDayIndex;
          const dayIsToday = isToday(day);

          return (
            <button
              key={index}
              onClick={() => onSelectDate(day)}
              aria-current={dayIsToday ? 'date' : undefined}
              className={` 
                aspect-square flex items-center justify-center rounded-b-md font-semibold text-[16px]
                transition-all duration-200 cursor-pointer
                ${
                  isSelected || dayIsToday
                    ? 'text-white shadow-md'
                    : 'text-[#1E1E1E] hover:bg-gray-100'
                }
              `}
              style={
                dayIsToday
                  ? { backgroundColor: '#E87524' }
                  : isSelected
                    ? { backgroundColor: '#502815' }
                    : undefined
              }
            >
              {dayOfMonth}
            </button>
          );
        })}
      </div>
    </div>
  );
};
