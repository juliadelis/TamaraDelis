import API_URL from './api';
import { fetchWithAuthRetry } from './session';

export type PersonalAppointment = {
  id: string;
  name: string;
  starts_at: string;
  duration_minutes: number;
  notes: string;
};

export async function getPersonalAppointments(filters: { from: string; to: string }): Promise<PersonalAppointment[]> {
  const response = await fetchWithAuthRetry(`${API_URL}/api/personal-appointments?${new URLSearchParams(filters)}`);
  if (!response.ok) throw new Error('Não foi possível carregar a agenda pessoal.');
  return response.json();
}

export async function savePersonalAppointment(payload: Omit<PersonalAppointment, 'id'>, id?: string): Promise<PersonalAppointment> {
  const response = await fetchWithAuthRetry(`${API_URL}/api/personal-appointments${id ? `/${encodeURIComponent(id)}` : ''}`, {
    method: id ? 'PUT' : 'POST', body: JSON.stringify(payload),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error || 'Não foi possível salvar o compromisso.');
  return body;
}

export async function deletePersonalAppointment(id: string): Promise<void> {
  const response = await fetchWithAuthRetry(`${API_URL}/api/personal-appointments/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'Não foi possível excluir o compromisso.');
  }
}
