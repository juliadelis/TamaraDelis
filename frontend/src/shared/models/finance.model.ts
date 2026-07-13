import type { PaymentMethod, PaymentStatus, SessionStatus } from './session.model';

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
  paymentMethod: PaymentMethod | '';
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
  patientEmail: string;
  patientPhone: string;
  mainComplaint: string;
  currentSessionPrice: number | null;
  monthlySessions: string;
  received: number;
  expected: number;
  sessions: number;
  sessionDetails: MonthlyPatientSessionSummary[];
}

export interface MonthlyPatientSessionSummary {
  id: string;
  title: string;
  startsAt: string;
  status: SessionStatus;
  sessionPrice: number | null;
  expectedAmount: number;
  receivedAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | '';
}

export interface MonthlyFinancialSummary {
  year: number;
  month: number;
  patients: MonthlyPatientFinancialSummary[];
  totalReceived: number;
  totalExpected: number;
  totalSessions: number;
}
