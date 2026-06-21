import type { DaySchedule, Patient } from "../models/types";

const today = new Date();
today.setHours(0, 0, 0, 0);

const PATIENT_NAMES = [
  'Maria Fernanda',
  'José Amancio',
  'Alice Martins',
  'Augusto Souza',
  'Luzia Santos',
  'Beatriz Lima',
  'Gabriel Alves',
  'Renata Carvalho',
  'Carla Mendes',
];

const TIME_SLOTS = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
];

const STATUSES: Patient['status'][] = ['pending', 'present', 'absent', 'rescheduled'];

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Maria Fernanda',
    time: '08:00',
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

const monthlyScheduleCache = new Map<string, DaySchedule[]>();

const buildMockMonthSchedules = (year: number, month: number): DaySchedule[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNumbers = Array.from({ length: 8 }, (_, index) => ((index * 4 + 3) % daysInMonth) + 1)
    .sort((a, b) => a - b)
    .filter((day, index, array) => array.indexOf(day) === index);

  return dayNumbers.map((day, index) => {
    const date = new Date(year, month, day);
    const patientCount = 1 + (index % 3);

    const patients = Array.from({ length: patientCount }, (_, appointmentIndex) => {
      const patientName = PATIENT_NAMES[(day + appointmentIndex) % PATIENT_NAMES.length];
      const time = TIME_SLOTS[(day + appointmentIndex * 5) % TIME_SLOTS.length];
      const status = STATUSES[(day + appointmentIndex) % STATUSES.length];

      return {
        id: `${year}-${month}-${day}-${appointmentIndex}`,
        name: patientName,
        time,
        status,
        details: 'Ver detalhes',
      };
    });

    return {
      date,
      patients,
    };
  });
};

export const getMonthSchedules = (year: number, month: number): DaySchedule[] => {
  const cacheKey = `${year}-${month}`;
  if (!monthlyScheduleCache.has(cacheKey)) {
    monthlyScheduleCache.set(cacheKey, buildMockMonthSchedules(year, month));
  }

  return monthlyScheduleCache.get(cacheKey) || [];
};

export const getScheduleForDate = (date: Date, schedules: DaySchedule[] = mockDaySchedules): Patient[] => {
  const schedule = schedules.find(
    (s) =>
      s.date.getDate() === date.getDate() &&
      s.date.getMonth() === date.getMonth() &&
      s.date.getFullYear() === date.getFullYear()
  );

  return schedule?.patients || [];
};
