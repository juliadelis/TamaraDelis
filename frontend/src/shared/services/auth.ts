import API_URL from './api';

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'authUser';

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export type AuthUser = {
  id: string;
  email: string | null;
  [key: string]: any;
};

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error || 'Falha ao fazer login');
  }

  if (!body.session?.access_token) {
    throw new Error('Resposta do servidor inválida');
  }

  saveAuthSession(body.session, body.user || {});
  return body;
}

export function saveAuthSession(session: AuthSession, user: AuthUser) {
  localStorage.setItem(AUTH_TOKEN_KEY, session.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
  return Boolean(getAuthToken());
}
