

export type PatientStatus = 'present' | 'absent' | 'rescheduled' | 'pending';

export interface Patient {
  id: string;
  name: string;
  time: string;
  status: PatientStatus;
  details?: string;
}

export interface DaySchedule {
  date: Date;
  patients: Patient[];
}

export const STATUS_COLORS: Record<PatientStatus, string> = {
  pending: 'bg-[#FFF5DD]',
  absent: 'bg-[#FEE4E6]',
  rescheduled: 'bg-[#EDE8F9]',
  present: 'bg-[#E0F5E4]',
};

export const STATUS_ACCENT_COLOR_BORDER: Record<PatientStatus, string> = {
  pending: 'border-[#CDA131]',
  absent: 'border-[#E10415]',
  rescheduled: 'border-[#9647FF]',
  present: 'border-[#2BA64B]',
};



export const STATUS_ACCENT_COLOR: Record<PatientStatus, string> = {
  pending: 'bg-[#CDA131]',
  absent: 'bg-[#E10415]',
  rescheduled: 'bg-[#9647FF]',
  present: 'bg-[#2BA64B]',
};

export const STATUS_LABEL: Record<PatientStatus, string> = {
  pending: 'Pendente',
  absent: 'Faltou',
  rescheduled: 'Reagendamento',
  present: 'Presente',
};

export const STATUS_TEXT_COLOR: Record<PatientStatus, string> = {
  pending: 'text-[#CDA131]',
  absent: 'text-[#E10415]',
  rescheduled: 'text-[#9647FF]',
  present: 'text-[#2BA64B]',
};

export const STATUS_ICON_COLOR: Record<PatientStatus, string> = {
  pending: 'text-[#CDA131]',
  absent: 'text-[#E10415]',
  rescheduled: 'text-[#9647FF]',
  present: 'text-[#2BA64B]',
};

export const STATUS_TIME_BG: Record<PatientStatus, string> = {
  pending: 'bg-[#FFF5DD]',
  absent: 'bg-[#FEE4E6]',
  rescheduled: 'bg-[#EDE8F9]',
  present: 'bg-[#E0F5E4]',
};

export const STATUS_BUTTON_BG: Record<PatientStatus, string> = {
  pending: 'bg-white border-[#CDA131] text-[#CDA131]',
  absent: 'bg-white border-[#E10415] text-[#E10415]',
  rescheduled: 'bg-white border-[#9647FF] text-[#9647FF]',
  present: 'bg-white border-[#2BA64B] text-[#2BA64B]',
};
