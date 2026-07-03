import type { PatientSession, PatientSessionPayload } from '../models/session.model';
import API_URL from './api';
import { getAuthToken, refreshAuthSession } from './auth';

type SessionFilters = {
  patientId?: string;
  from?: string;
  to?: string;
  status?: string;
};

function authHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function buildQuery(filters: SessionFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `?${query}` : '';
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

export async function getSessions(filters: SessionFilters = {}) {
  const response = await fetchWithAuthRetry(`${API_URL}/api/sessions${buildQuery(filters)}`);

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'Falha ao buscar sessoes.');
  }

  return response.json() as Promise<PatientSession[]>;
}

export async function saveSession(payload: PatientSessionPayload, id?: string) {
  const response = await fetchWithAuthRetry(`${API_URL}/api/sessions${id ? `/${id}` : ''}`, {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'Falha ao salvar sessao.');
  }

  return response.json() as Promise<PatientSession>;
}

export async function deleteSession(id: string, syncGoogle = false) {
  const response = await fetchWithAuthRetry(`${API_URL}/api/sessions/${id}?syncGoogle=${syncGoogle}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'Falha ao excluir sessao.');
  }
}
