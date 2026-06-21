import { useMemo, useState } from 'react';
import { AgendaCalendar } from './components/AgendaCalendar';
//import { DayAgenda } from './components/DayAgenda';
import { getMonthSchedules } from '../../../shared/mocks/mockData';
// import { getMonthName } from '../../../shared/utils/dateUtils';

export const Agenda = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const monthSchedules = useMemo(
    () => getMonthSchedules(currentYear, currentMonth),
    [currentMonth, currentYear]
  );

  const scheduleDays = useMemo(
    () => monthSchedules.map((item) => item.date.getDate()),
    [monthSchedules]
  );

  // const selectedDaySchedule = useMemo(
  //   () => getScheduleForDate(selectedDate, monthSchedules),
  //   [selectedDate, monthSchedules]
  // );

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
  };

  // const handlePrevDay = () => {
  //   const previous = new Date(selectedDate);
  //   previous.setDate(selectedDate.getDate() - 1);
  //   setSelectedDate(previous);
  //   setCurrentMonth(previous.getMonth());
  //   setCurrentYear(previous.getFullYear());
  // };

  // const handleNextDay = () => {
  //   const next = new Date(selectedDate);
  //   next.setDate(selectedDate.getDate() + 1);
  //   setSelectedDate(next);
  //   setCurrentMonth(next.getMonth());
  //   setCurrentYear(next.getFullYear());
  // };

  // const monthName = getMonthName(currentMonth);

  return (
    <div className="">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl text-left font-semibold text-[#502815]">Agenda</h2>
            <p className="mt-2 text-left text-[18px] text-[#502815]">
              Selecione um dia para ver os agendamentos.
            </p>
          </div>
         
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <AgendaCalendar
            selectedDate={selectedDate}
            month={currentMonth}
            year={currentYear}
            scheduleDays={scheduleDays}
            onSelectDate={handleSelectDate}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
          />

          {/* <DayAgenda
            selectedDate={selectedDate}
            patients={selectedDaySchedule}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
          /> */}
        </div>
      </div>
    </div>
  );
};
