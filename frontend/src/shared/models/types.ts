export type { Patient } from "./patient.model";
import type { Patient } from "./patient.model";


export type PatientStatus = 'present' | 'absent' | 'rescheduled' | 'pending';


export interface SessionConflict {
  internal: boolean;
  external: boolean;
}

export interface ConflictSectors {
  family: SessionConflict;
  social: SessionConflict;
  organic: SessionConflict;
  work: SessionConflict;
  relationship: SessionConflict;
}

export interface CongruenceItem {
  label: string;
  selected: boolean;
}

export interface PsychicDynamics {
  congruence: CongruenceItem[];
  dominantInstances: string[];
  excessLack: string[];
  responsibility: string[];
  anxietyPoints: string;
  defenses: {
    primitive: string[];
    intermediate: string[];
    mature: string[];
  };
}

export interface ClinicalAnalysis {
  falseSelf: string[];
  selfConstancy: string;
  selfConstancyNotes?: string;
  object: string;
  objectConstancy: string;
  objectConstancyNotes?: string;
  realityRelation: string;
  attachment: string;
}

export interface PatientRecord {
  id: string;
  fullName: string;
  cpf?: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  profession: string;
  fatherName?: string;
  motherName?: string;
  siblings?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  mainComplaint: string;
  nextSession: string;
  lastSession: string;
  monthlySessions: string;
  frequentTags: string[];
  generalNotes: string;
  createdAt: string;
  sessionNumber: string;
  sessionDate: string;
  sessionTheme: string;
  sessionMotives: string;
  conflictSectors: ConflictSectors;
  personalityStyle: string;
  psychicDynamics: PsychicDynamics;
  clinicalAnalysis: ClinicalAnalysis;
  treatmentType: string[];
  interventions: string[];
  significants: string;
  fantasyStructure: string;
  transference: string;
  countertransference: string;
  sessionTitle: string;
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
