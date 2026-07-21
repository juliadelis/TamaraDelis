export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'missed' | 'rescheduled';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';
export type PaymentMethod = 'pix' | 'cash';
export type SessionRecurrenceType = 'none' | 'monthly' | 'biweekly' | 'weekly' | 'twiceWeekly';

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
  cid: string;
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
  googleMeetLink: string;
  googleSyncStatus: string;
  googleLastSyncedAt: string;
  sessionPrice: number | null;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | '';
  paidAt: string;
  paidAmount: number | null;
  recurrenceGroupId: string;
  recurrenceType: SessionRecurrenceType;
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
  cid?: string;
  sessionTheme?: string;
  sessionMotives?: string;
  interventions?: string[];
  tags?: string[];
  moodScale?: number | null;
  anxietyScale?: number | null;
  recurrentThemes?: string;
  rescheduledFromStartsAt?: string;
  rescheduledFromEndsAt?: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod | '';
  recurrenceGroupId?: string;
  recurrenceType?: SessionRecurrenceType;
  syncGoogle?: boolean;
};

export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  scheduled: 'Agendada',
  completed: 'Realizada',
  cancelled: 'Cancelamento',
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
