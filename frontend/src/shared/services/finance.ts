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
    const sessions = await getSessions({ from, to, status: 'completed' });
    const patients = new Map<string, { patientId: string; patientName: string; received: number; sessions: number }>();

    sessions.forEach((session) => {
      const current = patients.get(session.patientId) || {
        patientId: session.patientId,
        patientName: session.patientName || 'Paciente sem nome',
        received: 0,
        sessions: 0,
      };

      current.received += session.paidAmount ?? session.sessionPrice ?? 0;
      current.sessions += 1;
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
      totalSessions: patientTotals.reduce((total, patient) => total + patient.sessions, 0),
    };
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'Falha ao buscar financeiro mensal.');
  }

  return response.json() as Promise<MonthlyFinancialSummary>;
}
