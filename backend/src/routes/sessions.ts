import { Router } from 'express';
import { supabase } from '../services/supabaseClient';
import { requireAuth } from '../middleware/auth';
import {
  deleteGoogleCalendarEvent,
  getGoogleCalendarConnectionStatus,
  upsertGoogleCalendarEvent,
} from '../services/googleCalendarService';

export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'missed' | 'rescheduled';

type SessionRow = {
  id: string;
  user_id: string;
  patient_id: string;
  title: string | null;
  session_number: number | null;
  starts_at: string;
  ends_at: string;
  timezone: string | null;
  status: SessionStatus | null;
  type: string | null;
  location: string | null;
  notes: string | null;
  clinical_notes: string | null;
  cid: string | null;
  session_theme: string | null;
  session_motives: string | null;
  interventions: string[] | null;
  tags: string[] | null;
  mood_scale: number | null;
  anxiety_scale: number | null;
  recurrent_themes: string | null;
  rescheduled_from_starts_at: string | null;
  rescheduled_from_ends_at: string | null;
  google_event_id: string | null;
  google_calendar_id: string | null;
  google_meet_link: string | null;
  google_sync_status: string | null;
  google_last_synced_at: string | null;
  session_price: number | null;
  payment_status: 'pending' | 'paid' | 'cancelled' | null;
  paid_at: string | null;
  paid_amount: number | null;
  created_at: string;
  updated_at: string | null;
  patients?: {
    full_name: string | null;
    email: string | null;
  } | null;
};

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function numberValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function rowToSession(row: SessionRow) {
  return {
    id: row.id,
    userId: row.user_id,
    patientId: row.patient_id,
    patientName: row.patients?.full_name || '',
    patientEmail: row.patients?.email || '',
    title: row.title || '',
    sessionNumber: row.session_number,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    timezone: row.timezone || 'America/Sao_Paulo',
    status: row.status || 'scheduled',
    type: row.type || '',
    location: row.location || '',
    notes: row.notes || '',
    clinicalNotes: row.clinical_notes || '',
    cid: row.cid || '',
    sessionTheme: row.session_theme || '',
    sessionMotives: row.session_motives || '',
    interventions: row.interventions || [],
    tags: row.tags || [],
    moodScale: row.mood_scale,
    anxietyScale: row.anxiety_scale,
    recurrentThemes: row.recurrent_themes || '',
    rescheduledFromStartsAt: row.rescheduled_from_starts_at || '',
    rescheduledFromEndsAt: row.rescheduled_from_ends_at || '',
    googleEventId: row.google_event_id || '',
    googleCalendarId: row.google_calendar_id || '',
    googleMeetLink: row.google_meet_link || '',
    googleSyncStatus: row.google_sync_status || '',
    googleLastSyncedAt: row.google_last_synced_at || '',
    sessionPrice: row.session_price,
    paymentStatus: row.payment_status || 'pending',
    paidAt: row.paid_at || '',
    paidAmount: row.paid_amount,
    createdAt: row.created_at,
    updatedAt: row.updated_at || '',
  };
}

function requestToRow(body: Record<string, unknown>, userId: string) {
  return {
    user_id: userId,
    patient_id: text(body.patientId),
    title: text(body.title) || null,
    session_number: numberValue(body.sessionNumber),
    starts_at: text(body.startsAt),
    ends_at: text(body.endsAt),
    timezone: text(body.timezone) || 'America/Sao_Paulo',
    status: (text(body.status) || 'scheduled') as SessionStatus,
    type: text(body.type) || null,
    location: text(body.location) || null,
    notes: text(body.notes) || null,
    clinical_notes: text(body.clinicalNotes) || null,
    cid: text(body.cid) || null,
    session_theme: text(body.sessionTheme) || null,
    session_motives: text(body.sessionMotives) || null,
    interventions: stringArray(body.interventions),
    tags: stringArray(body.tags),
    mood_scale: numberValue(body.moodScale),
    anxiety_scale: numberValue(body.anxietyScale),
    recurrent_themes: text(body.recurrentThemes) || null,
    rescheduled_from_starts_at: text(body.rescheduledFromStartsAt) || null,
    rescheduled_from_ends_at: text(body.rescheduledFromEndsAt) || null,
    updated_at: new Date().toISOString(),
  };
}

async function getEffectiveSessionPrice(patientId: string, startsAt: string) {
  const sessionDate = startsAt || new Date().toISOString();
  const { data: priceRows } = await supabase
    .from('patient_session_prices')
    .select('price')
    .eq('patient_id', patientId)
    .lte('starts_at', sessionDate)
    .or(`ends_at.is.null,ends_at.gt.${sessionDate}`)
    .order('starts_at', { ascending: false })
    .limit(1);

  const price = Array.isArray(priceRows) && priceRows[0]?.price;
  if (price !== undefined && price !== null) {
    return Number(price);
  }

  const { data: patient } = await supabase
    .from('patients')
    .select('session_price')
    .eq('id', patientId)
    .single();

  const fallbackPrice = (patient as { session_price?: number | null } | null)?.session_price;
  return fallbackPrice === undefined || fallbackPrice === null ? null : Number(fallbackPrice);
}

async function applyPaymentAutomation(
  payload: ReturnType<typeof requestToRow>,
  existing?: Pick<SessionRow, 'payment_status' | 'paid_at' | 'paid_amount' | 'session_price'> | null
): Promise<ReturnType<typeof requestToRow> & {
  session_price: number | null;
  payment_status: 'pending' | 'paid' | 'cancelled';
  paid_at: string | null;
  paid_amount: number | null;
}> {
  const sessionPrice = existing?.session_price ?? (await getEffectiveSessionPrice(payload.patient_id, payload.starts_at));

  if (payload.status === 'completed') {
    return {
      ...payload,
      session_price: sessionPrice,
      payment_status: 'paid',
      paid_at: existing?.payment_status === 'paid' && existing.paid_at ? existing.paid_at : new Date().toISOString(),
      paid_amount: sessionPrice,
    };
  }

  return {
    ...payload,
    session_price: sessionPrice,
    payment_status: payload.status === 'cancelled' ? 'cancelled' : 'pending',
    paid_at: null,
    paid_amount: null,
  };
}

async function shouldSyncGoogle(userId: string, requestedSync: unknown) {
  const explicitlyRequested = requestedSync === true || requestedSync === 'true';
  const googleStatus = await getGoogleCalendarConnectionStatus(userId);

  if (explicitlyRequested && !googleStatus.connected) {
    throw new Error('Google Agenda nao conectado. Entre com Google novamente e autorize o acesso ao calendario.');
  }

  return googleStatus.connected;
}

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const userId = (req as any).user.id as string;
  const { patientId, from, to, status } = req.query;

  let query = supabase
    .from('patient_sessions')
    .select('*, patients(full_name, email)')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('starts_at', { ascending: true });

  if (typeof patientId === 'string' && patientId) {
    query = query.eq('patient_id', patientId);
  }

  if (typeof from === 'string' && from) {
    query = query.gte('starts_at', from);
  }

  if (typeof to === 'string' && to) {
    query = query.lte('starts_at', to);
  }

  if (typeof status === 'string' && status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json((data as SessionRow[]).map(rowToSession));
});

router.get('/:id', async (req, res) => {
  const userId = (req as any).user.id as string;
  const { data, error } = await supabase
    .from('patient_sessions')
    .select('*, patients(full_name, email)')
    .eq('id', req.params.id)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();

  if (error) {
    return res.status(error.code === 'PGRST116' ? 404 : 500).json({ error: error.message });
  }

  return res.json(rowToSession(data as SessionRow));
});

router.post('/', async (req, res) => {
  const userId = (req as any).user.id as string;
  const payload = requestToRow(req.body, userId);

  if (!payload.patient_id || !payload.starts_at || !payload.ends_at) {
    return res.status(400).json({ error: 'Paciente, inicio e fim da sessão sao obrigatorios.' });
  }

  let syncGoogle = false;
  try {
    syncGoogle = await shouldSyncGoogle(userId, req.body.syncGoogle);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }

  const { data, error } = await supabase
    .from('patient_sessions')
    .insert(await applyPaymentAutomation(payload))
    .select('*, patients(full_name, email)')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  let row = data as SessionRow;

  if (syncGoogle) {
    row = (await upsertGoogleCalendarEvent(userId, row)) as SessionRow;
  }

  return res.status(201).json(rowToSession(row));
});

router.put('/:id', async (req, res) => {
  const userId = (req as any).user.id as string;
  const payload = requestToRow(req.body, userId);

  if (!payload.patient_id || !payload.starts_at || !payload.ends_at) {
    return res.status(400).json({ error: 'Paciente, inicio e fim da sessão sao obrigatorios.' });
  }

  let syncGoogle = false;
  try {
    syncGoogle = await shouldSyncGoogle(userId, req.body.syncGoogle);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }

  const { data: existing, error: existingError } = await supabase
    .from('patient_sessions')
    .select('payment_status, paid_at, paid_amount, session_price')
    .eq('id', req.params.id)
    .eq('user_id', userId)
    .single();

  if (existingError) {
    return res.status(existingError.code === 'PGRST116' ? 404 : 500).json({ error: existingError.message });
  }

  const { data, error } = await supabase
    .from('patient_sessions')
    .update(await applyPaymentAutomation(payload, existing as SessionRow))
    .eq('id', req.params.id)
    .eq('user_id', userId)
    .select('*, patients(full_name, email)')
    .single();

  if (error) {
    return res.status(error.code === 'PGRST116' ? 404 : 500).json({ error: error.message });
  }

  let row = data as SessionRow;

  if (syncGoogle) {
    row = (await upsertGoogleCalendarEvent(userId, row)) as SessionRow;
  }

  return res.json(rowToSession(row));
});

router.delete('/:id', async (req, res) => {
  const userId = (req as any).user.id as string;
  const { data, error: fetchError } = await supabase
    .from('patient_sessions')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', userId)
    .single();

  if (fetchError) {
    return res.status(fetchError.code === 'PGRST116' ? 404 : 500).json({ error: fetchError.message });
  }

  const { error } = await supabase
    .from('patient_sessions')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('user_id', userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (req.query.syncGoogle === 'true' || data.google_event_id) {
    try {
      await deleteGoogleCalendarEvent(userId, data as SessionRow);
    } catch (googleError) {
      console.error('Falha ao excluir evento no Google Calendar:', googleError);
    }
  }

  return res.status(204).send();
});

export default router;
