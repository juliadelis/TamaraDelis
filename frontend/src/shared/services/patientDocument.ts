import type { PatientDocument, PatientDocumentPayload } from '../models/patient-document.model';
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

export async function getPatientDocuments(patientId: string) {
  const params = new URLSearchParams({ patientId });
  const response = await fetchWithAuthRetry(`${API_URL}/api/documents?${params.toString()}`);

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'Falha ao buscar documentos do paciente.');
  }

  return response.json() as Promise<PatientDocument[]>;
}

export async function savePatientDocument(payload: PatientDocumentPayload) {
  const response = await fetchWithAuthRetry(`${API_URL}/api/documents`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'Falha ao salvar documento.');
  }

  return response.json() as Promise<PatientDocument>;
}

export async function updatePatientDocument(id: string, payload: PatientDocumentPayload) {
  const response = await fetchWithAuthRetry(`${API_URL}/api/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'Falha ao atualizar documento.');
  }

  return response.json() as Promise<PatientDocument>;
}

export async function deletePatientDocument(id: string) {
  const response = await fetchWithAuthRetry(`${API_URL}/api/documents/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'Falha ao apagar documento.');
  }
}

