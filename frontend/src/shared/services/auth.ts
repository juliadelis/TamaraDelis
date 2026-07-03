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

export async function getGoogleLoginUrl(next = '/') {
  const response = await fetch(`${API_URL}/api/auth/google/url?next=${encodeURIComponent(next)}`);
  const body = await response.json();

  if (!response.ok || !body.url) {
    throw new Error(body?.error || 'Falha ao iniciar login com Google');
  }

  return body.url as string;
}

export async function getGoogleCalendarStatus() {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/api/auth/google/status`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error || 'Falha ao verificar Google Agenda');
  }

  return body as {
    connected: boolean;
    syncEnabled: boolean;
    googleEmail: string;
    calendarId: string;
    hasRefreshToken: boolean;
    expiresAt?: string;
  };
}

export function saveAuthSession(session: AuthSession, user: AuthUser) {
  localStorage.setItem(AUTH_TOKEN_KEY, session.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function refreshAuthSession() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('Sessao expirada. Faca login novamente.');
  }

  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const body = await response.json();
  if (!response.ok || !body.session?.access_token) {
    logout();
    throw new Error(body?.error || 'Sessao expirada. Faca login novamente.');
  }

  saveAuthSession(body.session, body.user || getUser() || {});
  return body.session as AuthSession;
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
