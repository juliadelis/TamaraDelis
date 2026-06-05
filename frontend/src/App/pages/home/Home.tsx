import { useState, useCallback } from 'react';
import { Calendar } from './components/Calendar';
import { DailySchedule } from './components/DailySchedule';
import { getScheduleForDate } from '../../../shared/mocks/mockData';

export const Home = () => {
  
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const patients = getScheduleForDate(selectedDate);

  const handleSelectDate = useCallback((date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    setSelectedDate(newDate);
  }, []);

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
            <DailySchedule patients={patients} />
          </div>
        </div>
      </div>
    </div>
  );
}