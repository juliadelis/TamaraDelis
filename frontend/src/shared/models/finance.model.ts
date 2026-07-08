import type { SessionStatus } from './session.model';

export type PaymentStatus = 'pending' | 'paid' | 'cancelled';

export interface PatientSessionPriceHistory {
  id: string;
  patientId: string;
  price: number;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

export interface PatientFinancialSession {
  id: string;
  title: string;
  startsAt: string;
  status: SessionStatus;
  sessionPrice: number | null;
  paymentStatus: PaymentStatus;
  paidAt: string;
  paidAmount: number | null;
}

export interface PatientFinancialSummary {
  currentPrice: number | null;
  priceHistory: PatientSessionPriceHistory[];
  sessions: PatientFinancialSession[];
}

export interface MonthlyPatientFinancialSummary {
  patientId: string;
  patientName: string;
  received: number;
  sessions: number;
}

export interface MonthlyFinancialSummary {
  year: number;
  month: number;
  patients: MonthlyPatientFinancialSummary[];
  totalReceived: number;
  totalSessions: number;
}
