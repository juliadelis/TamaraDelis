import type { MonthlyFinancialSummary, PatientFinancialSummary } from '../models/finance.model';
import { getSessions } from './session';
import API_URL from './api';
import { getAuthToken, refreshAuthSession } from './auth';

function authHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchWithAuthRetry(input: RequestInfo | URL, init: RequestInit = {}) {
  let response = await fetch(input, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init.headers || {}),
    },
  });

  if (response.status === 401) {
    await refreshAuthSession();
    response = await fetch(input, {
      ...init,
      headers: {
        ...authHeaders(),
        ...(init.headers || {}),
      },
    });
  }

  return response;
}

export async function getPatientFinancialSummary(patientId: string) {
  const response = await fetchWithAuthRetry(`${API_URL}/api/finance/patients/${patientId}`);

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'Falha ao buscar financeiro do paciente.');
  }

  return response.json() as Promise<PatientFinancialSummary>;
}

export async function getMonthlyFinancialSummary(year: number, month: number) {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  const response = await fetchWithAuthRetry(`${API_URL}/api/finance/monthly?${params.toString()}`);

  if (response.status === 404) {
    const from = new Date(year, month - 1, 1, 0, 0, 0, 0).toISOString();
    const to = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
    const sessions = await getSessions({ from, to });
    const patients = new Map<
      string,
      MonthlyFinancialSummary['patients'][number]
    >();

    sessions.forEach((session) => {
      if (session.status === 'cancelled' || session.status === 'rescheduled') {
        return;
      }

      const current = patients.get(session.patientId) || {
        patientId: session.patientId,
        patientName: session.patientName || 'Paciente sem nome',
        patientEmail: session.patientEmail || '',
        patientPhone: '',
        mainComplaint: '',
        currentSessionPrice: null,
        monthlySessions: '',
        received: 0,
        expected: 0,
        sessions: 0,
        sessionDetails: [],
      };

      const expectedAmount = session.sessionPrice ?? 0;
      const receivedAmount =
        session.status === 'completed' && session.paymentStatus === 'paid'
          ? session.paidAmount ?? session.sessionPrice ?? 0
          : 0;

      current.expected += expectedAmount;
      current.received += receivedAmount;
      current.sessions += 1;
      current.sessionDetails.push({
        id: session.id,
        title: session.title,
        startsAt: session.startsAt,
        status: session.status,
        sessionPrice: session.sessionPrice,
        expectedAmount,
        receivedAmount,
        paymentStatus: session.paymentStatus,
        paymentMethod: session.paymentMethod,
      });
      patients.set(session.patientId, current);
    });

    const patientTotals = Array.from(patients.values()).sort((a, b) =>
      a.patientName.localeCompare(b.patientName, 'pt-BR')
    );

    return {
      year,
      month,
      patients: patientTotals,
      totalReceived: patientTotals.reduce((total, patient) => total + patient.received, 0),
      totalExpected: patientTotals.reduce((total, patient) => total + patient.expected, 0),
      totalSessions: patientTotals.reduce((total, patient) => total + patient.sessions, 0),
    };
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'Falha ao buscar financeiro mensal.');
  }

  return response.json() as Promise<MonthlyFinancialSummary>;
}
