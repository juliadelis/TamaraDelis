import type { PatientFinancialSummary } from '../models/finance.model';
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
