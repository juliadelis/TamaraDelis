import API_URL from './api';
import { fetchWithAuthRetry } from './session';
import type { ExpenseCategory } from './personalFinance';
export const PERSONAL_RECURRENCE = { none: 'Não repetir', weekly: '1 vez por semana', biweekly: 'Quinzenal', monthly: 'Mensal' } as const;
export type PersonalRecurrence = keyof typeof PERSONAL_RECURRENCE;

export type PersonalAppointment = {
  id: string;
  name: string;
  starts_at: string;
  duration_minutes: number;
  notes: string;
  recurrence_type?: PersonalRecurrence;
  recurrence_until?: string | null;
  recurrence_group_id?: string | null;
  expense?: { amount: number; category: ExpenseCategory } | null;
};

export async function getPersonalAppointments(filters: { from: string; to: string }): Promise<PersonalAppointment[]> {
  const response = await fetchWithAuthRetry(`${API_URL}/api/personal-appointments?${new URLSearchParams(filters)}`);
  if (!response.ok) throw new Error('Não foi possível carregar a agenda pessoal.');
  return response.json();
}

export async function savePersonalAppointment(payload: Omit<PersonalAppointment, 'id' | 'expense'> & { amount: number | null; category: ExpenseCategory | null }, id?: string): Promise<PersonalAppointment> {
  const response = await fetchWithAuthRetry(`${API_URL}/api/personal-appointments${id ? `/${encodeURIComponent(id)}` : ''}`, {
    method: id ? 'PUT' : 'POST', body: JSON.stringify(payload),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error || 'Não foi possível salvar o compromisso.');
  return body;
}

export type PersonalDeleteScope = 'single' | 'all' | 'future';
export async function deletePersonalAppointment(id: string, scope: PersonalDeleteScope = 'single'): Promise<string[]> {
  const response = await fetchWithAuthRetry(`${API_URL}/api/personal-appointments/${encodeURIComponent(id)}?scope=${scope}`, { method: 'DELETE' });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'Não foi possível excluir o compromisso.');
  }
  return (await response.json()).deletedIds;
}
