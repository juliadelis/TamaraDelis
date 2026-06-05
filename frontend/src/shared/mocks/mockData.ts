import type { DaySchedule, Patient } from "../models/types";


const today = new Date();
today.setHours(0, 0, 0, 0);

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Maria Fernanda',
    time: '8:00',
    status: 'present',
    details: 'Ver detalhes',
  },
  {
    id: '2',
    name: 'José Amancio',
    time: '10:00',
    status: 'absent',
    details: 'Ver detalhes',
  },
  {
    id: '3',
    name: 'Augusto Souza',
    time: '14:00',
    status: 'pending',
    details: 'Ver detalhes',
  },
  {
    id: '4',
    name: 'Luzia Santos',
    time: '16:00',
    status: 'pending',
    details: 'Ver detalhes',
  },
];


export const mockDaySchedules: DaySchedule[] = [
  {
    date: today,
    patients: mockPatients,
  },
];


export const getScheduleForDate = (date: Date): Patient[] => {
  const schedule = mockDaySchedules.find(
    (s) =>
      s.date.getDate() === date.getDate() &&
      s.date.getMonth() === date.getMonth() &&
      s.date.getFullYear() === date.getFullYear()
  );

  return schedule?.patients || [];
};
