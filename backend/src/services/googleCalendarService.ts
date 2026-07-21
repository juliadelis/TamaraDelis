import crypto from 'crypto';
import { supabase } from './supabaseClient';

type GoogleConnectionRow = {
  id: string;
  user_id: string;
  google_email: string | null;
  calendar_id: string | null;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  expires_at: string | null;
  sync_enabled: boolean | null;
};

type SessionRow = {
  id: string;
  user_id?: string;
  patient_id: string;
  title: string | null;
  session_number?: number | null;
  starts_at: string;
  ends_at: string;
  timezone: string | null;
  status?: string | null;
  type?: string | null;
  location: string | null;
  notes: string | null;
  clinical_notes?: string | null;
  session_theme?: string | null;
  session_motives?: string | null;
  interventions?: string[] | null;
  tags?: string[] | null;
  mood_scale?: number | null;
  anxiety_scale?: number | null;
  recurrent_themes?: string | null;
  rescheduled_from_starts_at?: string | null;
  rescheduled_from_ends_at?: string | null;
  google_event_id: string | null;
  google_calendar_id: string | null;
  google_meet_link?: string | null;
  google_sync_status?: string | null;
  google_last_synced_at?: string | null;
  created_at?: string;
  updated_at?: string | null;
  patients?: {
    full_name: string | null;
    email: string | null;
  } | null;
};

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_URL = 'https://www.googleapis.com/calendar/v3';
const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY || '';

function getEncryptionKey() {
  if (!encryptionKey) {
    throw new Error('TOKEN_ENCRYPTION_KEY não configurada.');
  }

  return crypto.createHash('sha256').update(encryptionKey).digest();
}

export function encryptToken(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`;
}

export function decryptToken(value: string) {
  const [ivRaw, tagRaw, encryptedRaw] = value.split('.');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(ivRaw, 'base64')
  );
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

async function getConnection(userId: string) {
  const { data, error } = await supabase
    .from('google_calendar_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('sync_enabled', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as GoogleConnectionRow;
}

export async function getGoogleCalendarConnectionStatus(userId: string) {
  const { data, error } = await supabase
    .from('google_calendar_connections')
    .select('google_email, calendar_id, sync_enabled, expires_at, access_token_encrypted, refresh_token_encrypted')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return {
      connected: false,
      syncEnabled: false,
      googleEmail: '',
      calendarId: '',
      hasRefreshToken: false,
    };
  }

  const accessTokenStillValid = data.expires_at
    ? new Date(data.expires_at).getTime() > Date.now() + 60_000
    : false;

  return {
    connected: Boolean(
      data.sync_enabled && (data.refresh_token_encrypted || (data.access_token_encrypted && accessTokenStillValid))
    ),
    syncEnabled: Boolean(data.sync_enabled),
    googleEmail: data.google_email || '',
    calendarId: data.calendar_id || 'primary',
    hasRefreshToken: Boolean(data.refresh_token_encrypted),
    expiresAt: data.expires_at || '',
  };
}

async function refreshAccessToken(connection: GoogleConnectionRow) {
  if (!connection.refresh_token_encrypted) {
    throw new Error('Conexao Google sem refresh token.');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET não configurados.');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: decryptToken(connection.refresh_token_encrypted),
      grant_type: 'refresh_token',
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error_description || body?.error || 'Falha ao renovar token Google.');
  }

  const expiresAt = new Date(Date.now() + Number(body.expires_in || 3600) * 1000).toISOString();

  await supabase
    .from('google_calendar_connections')
    .update({
      access_token_encrypted: encryptToken(body.access_token),
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', connection.id);

  return body.access_token as string;
}

async function getValidAccessToken(connection: GoogleConnectionRow) {
  const expiresAt = connection.expires_at ? new Date(connection.expires_at).getTime() : 0;
  const shouldRefresh = !connection.access_token_encrypted || expiresAt < Date.now() + 60_000;

  if (shouldRefresh) {
    return refreshAccessToken(connection);
  }

  return decryptToken(connection.access_token_encrypted as string);
}

async function googleRequest(
  connection: GoogleConnectionRow,
  path: string,
  init: RequestInit = {}
) {
  const accessToken = await getValidAccessToken(connection);
  const response = await fetch(`${GOOGLE_CALENDAR_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers || {}),
    },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error?.message || 'Falha na comunicacao com Google Calendar.');
  }

  return body;
}

function getGoogleMeetLink(event: any) {
  const videoEntryPoint = event?.conferenceData?.entryPoints?.find(
    (entryPoint: any) => entryPoint.entryPointType === 'video' && entryPoint.uri
  );

  return event?.hangoutLink || videoEntryPoint?.uri || null;
}

function isMissingGoogleMeetLinkColumn(error: any) {
  return (
    error?.code === 'PGRST204' ||
    String(error?.message || '').includes("'google_meet_link' column") ||
    String(error?.message || '').includes('google_meet_link')
  );
}

async function updateGoogleSyncMetadata(sessionId: string, values: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('patient_sessions')
    .update(values)
    .eq('id', sessionId)
    .select('*, patients(full_name, email)')
    .single();

  if (!error) {
    return data as SessionRow;
  }

  if (!('google_meet_link' in values) || !isMissingGoogleMeetLinkColumn(error)) {
    throw new Error(error.message);
  }

  const { google_meet_link, ...fallbackValues } = values;
  const { data: fallbackData, error: fallbackError } = await supabase
    .from('patient_sessions')
    .update(fallbackValues)
    .eq('id', sessionId)
    .select('*, patients(full_name, email)')
    .single();

  if (fallbackError) {
    throw new Error(fallbackError.message);
  }

  return fallbackData as SessionRow;
}

export async function upsertGoogleCalendarEvent(userId: string, session: SessionRow) {
  const connection = await getConnection(userId);
  if (!connection) {
    throw new Error('Google Agenda não conectado. Entre com Google novamente e autorize o acesso ao calendario.');
  }

  const calendarId = session.google_calendar_id || connection.calendar_id || 'primary';
  const patientName = session.patients?.full_name || 'Paciente';
  const patientEmail = session.patients?.email?.trim();
  if (!patientEmail) {
    throw new Error('Cadastre o e-mail do paciente antes de criar uma sessao online.');
  }
  const title = session.title || `Sessão - ${patientName}`;

  const eventBody = {
    summary: title,
    location: session.location || undefined,
    description: session.notes || undefined,
    start: {
      dateTime: session.starts_at,
      timeZone: session.timezone || 'America/Sao_Paulo',
    },
    end: {
      dateTime: session.ends_at,
      timeZone: session.timezone || 'America/Sao_Paulo',
    },
    attendees: [{ email: patientEmail }],
    extendedProperties: {
      private: {
        patientSessionId: session.id,
        patientId: session.patient_id,
        source: 'tamara-delis',
      },
    },
    conferenceData: {
      createRequest: {
        requestId: `tamara-delis-${session.id}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    },
  };

  const eventPath = session.google_event_id
    ? `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(session.google_event_id)}`
    : `/calendars/${encodeURIComponent(calendarId)}/events`;
  const path = `${eventPath}?${new URLSearchParams({
    conferenceDataVersion: '1',
    sendUpdates: 'all',
  }).toString()}`;

  const event = await googleRequest(connection, path, {
    method: session.google_event_id ? 'PATCH' : 'POST',
    body: JSON.stringify(eventBody),
  });

  return updateGoogleSyncMetadata(session.id, {
    google_event_id: event.id,
    google_calendar_id: calendarId,
    google_meet_link: getGoogleMeetLink(event),
    google_sync_status: 'synced',
    google_last_synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export async function deleteGoogleCalendarEvent(
  userId: string,
  session: SessionRow,
  sendUpdates: 'all' | 'none' = 'all'
) {
  const connection = await getConnection(userId);
  const calendarId = session.google_calendar_id || connection?.calendar_id || 'primary';

  if (!connection || !session.google_event_id) {
    return;
  }

  const path = `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(
    session.google_event_id
  )}?${new URLSearchParams({ sendUpdates }).toString()}`;

  await googleRequest(connection, path, {
    method: 'DELETE',
  });
}
