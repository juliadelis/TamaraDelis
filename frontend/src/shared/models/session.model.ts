export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'missed' | 'rescheduled';

export interface PatientSession {
  id: string;
  userId: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  title: string;
  sessionNumber: number | null;
  startsAt: string;
  endsAt: string;
  timezone: string;
  status: SessionStatus;
  type: string;
  location: string;
  notes: string;
  clinicalNotes: string;
  sessionTheme: string;
  sessionMotives: string;
  interventions: string[];
  tags: string[];
  moodScale: number | null;
  anxietyScale: number | null;
  recurrentThemes: string;
  rescheduledFromStartsAt: string;
  rescheduledFromEndsAt: string;
  googleEventId: string;
  googleCalendarId: string;
  googleSyncStatus: string;
  googleLastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type PatientSessionPayload = {
  patientId: string;
  title: string;
  sessionNumber?: number | null;
  startsAt: string;
  endsAt: string;
  timezone: string;
  status: SessionStatus;
  type?: string;
  location?: string;
  notes?: string;
  clinicalNotes?: string;
  sessionTheme?: string;
  sessionMotives?: string;
  interventions?: string[];
  tags?: string[];
  moodScale?: number | null;
  anxietyScale?: number | null;
  recurrentThemes?: string;
  rescheduledFromStartsAt?: string;
  rescheduledFromEndsAt?: string;
  syncGoogle?: boolean;
};

export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  scheduled: 'Agendada',
  completed: 'Realizada',
  cancelled: 'Cancelada',
  missed: 'Falta',
  rescheduled: 'Remarcada',
};

export const SESSION_STATUS_CLASS: Record<SessionStatus, string> = {
  scheduled: 'border-l-[#CDA131] bg-[#FFF5DD]',
  completed: 'border-l-[#2BA64B] bg-[#E0F5E4]',
  cancelled: 'border-l-[#E10415] bg-[#FEE4E6]',
  missed: 'border-l-[#E10415] bg-[#FEE4E6]',
  rescheduled: 'border-l-[#9647FF] bg-[#EDE8F9]',
};
