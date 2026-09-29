import API_URL from './api';
import { fetchWithAuthRetry } from './session';

export const EXPENSE_CATEGORIES = [
  ['mercado', 'Mercado'], ['necessidades', 'Necessidades'], ['eletronicos', 'Eletrônicos'],
  ['assinaturas', 'Assinaturas'], ['roupa', 'Roupa'], ['beleza', 'Beleza'], ['presentes', 'Presentes'],
  ['saude', 'Saúde'], ['despesas_eventuais', 'Despesas eventuais'], ['desenvolvimento', 'Desenvolvimento'],
  ['transporte', 'Transporte'], ['restaurante', 'Restaurante'], ['lazer', 'Lazer'], ['contas', 'Contas'],
] as const;
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number][0];
export type PersonalExpense = { id: string; name: string; amount: number; category: ExpenseCategory; spent_on: string };
export type PersonalFinanceSummary = { expenses: PersonalExpense[]; received: number; spent: number; balance: number };

async function request(path: string, init?: RequestInit) {
  const response = await fetchWithAuthRetry(`${API_URL}/api/personal-finance${path}`, init);
  if (response.status === 204) return;
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Não foi possível concluir a operação.');
  return data;
}
export function getPersonalFinance(year: number, month: number): Promise<PersonalFinanceSummary> {
  return request(`?year=${year}&month=${month}`);
}
export function savePersonalExpense(expense: Omit<PersonalExpense, 'id'>, id?: string): Promise<PersonalExpense> {
  return request(id ? `/${encodeURIComponent(id)}` : '', { method: id ? 'PUT' : 'POST', body: JSON.stringify(expense) });
}
export function deletePersonalExpense(id: string): Promise<void> {
  return request(`/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
