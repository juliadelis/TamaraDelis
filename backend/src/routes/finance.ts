import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createAuthenticatedSupabaseClient, supabase } from '../services/supabaseClient';

type PriceHistoryRow = {
  id: string;
  patient_id: string;
  price: number;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
};

type SessionFinanceRow = {
  id: string;
  patient_id?: string;
  starts_at: string;
  title: string | null;
  status: string | null;
  session_price: number | null;
  payment_status: string | null;
  payment_method: 'pix' | 'cash' | null;
  paid_at: string | null;
  paid_amount: number | null;
  patients?: {
    full_name: string | null;
  } | null;
};

type MonthlySessionFinanceRow = {
  id: string;
  patient_id: string;
  starts_at: string;
  title: string | null;
  status: string | null;
  session_price: number | null;
  payment_status: string | null;
  payment_method: 'pix' | 'cash' | null;
  paid_amount: number | null;
  patients?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    main_complaint: string | null;
    session_price: number | null;
    monthly_sessions: string | null;
  } | null;
};

const router = Router();

router.use(requireAuth);

router.get('/monthly', async (req, res) => {
  const userId = (req as any).user.id as string;
  const accessToken = req.headers.authorization?.split(' ')[1] || '';
  const authenticatedSupabase = createAuthenticatedSupabaseClient(accessToken);
  const year = Number(req.query.year);
  const month = Number(req.query.month);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return res.status(400).json({ error: 'Mes e ano sao obrigatorios.' });
  }

  const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)).toISOString();
  const to = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)).toISOString();

  const [{ data, error }, { data: notes, error: notesError }] = await Promise.all([
    supabase
    .from('patient_sessions')
    .select(
      'id, patient_id, starts_at, title, status, session_price, payment_status, payment_method, paid_amount, patients(full_name, email, phone, main_complaint, session_price, monthly_sessions)'
    )
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('starts_at', from)
    .lt('starts_at', to)
    .order('starts_at', { ascending: true }),
    authenticatedSupabase
      .from('patient_monthly_financial_notes')
      .select('patient_id, notes')
      .eq('user_id', userId)
      .eq('year', year)
      .eq('month', month),
  ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (notesError) {
    return res.status(500).json({ error: notesError.message });
  }

  const notesByPatient = new Map(
    ((notes || []) as Array<{ patient_id: string; notes: string | null }>).map((item) => [item.patient_id, item.notes || ''])
  );

  const patients = new Map<
    string,
    {
      patientId: string;
      patientName: string;
      patientEmail: string;
      patientPhone: string;
      mainComplaint: string;
      currentSessionPrice: number | null;
      monthlySessions: string;
      monthlyNotes: string;
      received: number;
      expected: number;
      sessions: number;
      sessionDetails: Array<{
        id: string;
        title: string;
        startsAt: string;
        status: string;
        sessionPrice: number | null;
        expectedAmount: number;
        receivedAmount: number;
        paymentStatus: string;
        paymentMethod: 'pix' | 'cash' | '';
      }>;
    }
  >();

  ((data || []) as unknown as MonthlySessionFinanceRow[]).forEach((session) => {
    if (session.status === 'rescheduled') {
      return;
    }

    const patientId = session.patient_id || 'sem-paciente';
    const current = patients.get(patientId) || {
      patientId,
      patientName: session.patients?.full_name || 'Paciente sem nome',
      patientEmail: session.patients?.email || '',
      patientPhone: session.patients?.phone || '',
      mainComplaint: session.patients?.main_complaint || '',
      currentSessionPrice: session.patients?.session_price ?? null,
      monthlySessions: session.patients?.monthly_sessions || '',
      monthlyNotes: notesByPatient.get(patientId) || '',
      received: 0,
      expected: 0,
      sessions: 0,
      sessionDetails: [],
    };

    const expectedAmount =
      session.status === 'cancelled'
        ? 0
        : session.status === 'missed'
        ? session.payment_status === 'cancelled'
          ? 0
          : Number(session.paid_amount ?? (session.session_price ?? 0) * 0.5)
        : Number(session.session_price ?? 0);
    const receivedAmount =
      session.status !== 'cancelled' && session.payment_status === 'paid'
        ? Number(session.paid_amount ?? session.session_price ?? 0)
        : 0;

    current.expected += expectedAmount;
    current.received += receivedAmount;
    current.sessions += 1;
    current.sessionDetails.push({
      id: session.id,
      title: session.title || '',
      startsAt: session.starts_at,
      status: session.status || 'scheduled',
      sessionPrice: session.session_price,
      expectedAmount,
      receivedAmount,
      paymentStatus: session.payment_status || 'pending',
      paymentMethod: session.payment_method || '',
    });
    patients.set(patientId, current);
  });

  const patientTotals = Array.from(patients.values()).sort((a, b) =>
    a.patientName.localeCompare(b.patientName, 'pt-BR')
  );

  return res.json({
    year,
    month,
    patients: patientTotals,
    totalReceived: patientTotals.reduce((total, patient) => total + patient.received, 0),
    totalExpected: patientTotals.reduce((total, patient) => total + patient.expected, 0),
    totalSessions: patientTotals.reduce((total, patient) => total + patient.sessions, 0),
  });
});

function validPeriod(year: number, month: number) {
  return Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12;
}

router.patch('/monthly/pay', async (req, res) => {
  const userId = (req as any).user.id as string;
  const { patientId, paymentMethod } = req.body || {};
  const year = Number(req.body?.year);
  const month = Number(req.body?.month);

  if (!patientId || !validPeriod(year, month) || !['pix', 'cash'].includes(paymentMethod)) {
    return res.status(400).json({ error: 'Paciente, mes, ano e metodo de pagamento sao obrigatorios.' });
  }

  const from = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const to = new Date(Date.UTC(year, month, 1)).toISOString();
  const { data: sessions, error: fetchError } = await supabase
    .from('patient_sessions')
    .select('id, session_price')
    .eq('user_id', userId)
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .gte('starts_at', from)
    .lt('starts_at', to)
    .not('status', 'in', '(cancelled,rescheduled)');

  if (fetchError) return res.status(500).json({ error: fetchError.message });

  const paidAt = new Date().toISOString();
  const rows = (sessions || []) as Array<{ id: string; session_price: number | null }>;
  const results = await Promise.all(
    rows.map((session) =>
      supabase
        .from('patient_sessions')
        .update({
          payment_status: 'paid',
          payment_method: paymentMethod,
          paid_at: paidAt,
          paid_amount: Number(session.session_price ?? 0),
        })
        .eq('id', session.id)
        .eq('user_id', userId)
    )
  );
  const updateError = results.find((result) => result.error)?.error;
  if (updateError) return res.status(500).json({ error: updateError.message });

  return res.json({ updated: rows.length });
});

router.put('/monthly/notes', async (req, res) => {
  const userId = (req as any).user.id as string;
  const accessToken = req.headers.authorization?.split(' ')[1] || '';
  const authenticatedSupabase = createAuthenticatedSupabaseClient(accessToken);
  const { patientId } = req.body || {};
  const year = Number(req.body?.year);
  const month = Number(req.body?.month);
  const notes = String(req.body?.notes || '').trim();

  if (!patientId || !validPeriod(year, month)) {
    return res.status(400).json({ error: 'Paciente, mes e ano sao obrigatorios.' });
  }

  const { data: patientSession, error: patientError } = await supabase
    .from('patient_sessions')
    .select('id')
    .eq('patient_id', patientId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle();
  if (patientError) return res.status(500).json({ error: patientError.message });
  if (!patientSession) return res.status(404).json({ error: 'Paciente nao encontrado.' });

  const { error } = await authenticatedSupabase.from('patient_monthly_financial_notes').upsert(
    { user_id: userId, patient_id: patientId, year, month, notes, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,patient_id,year,month' }
  );
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ notes });
});

router.get('/patients/:patientId', async (req, res) => {
  const userId = (req as any).user.id as string;
  const { patientId } = req.params;

  const [{ data: patient, error: patientError }, { data: priceHistory, error: historyError }, { data: sessions, error: sessionsError }] =
    await Promise.all([
      supabase.from('patients').select('session_price').eq('id', patientId).single(),
      supabase
        .from('patient_session_prices')
        .select('*')
        .eq('patient_id', patientId)
        .order('starts_at', { ascending: false }),
      supabase
        .from('patient_sessions')
        .select('id, starts_at, title, status, session_price, payment_status, payment_method, paid_at, paid_amount')
        .eq('user_id', userId)
        .eq('patient_id', patientId)
        .is('deleted_at', null)
        .order('starts_at', { ascending: false }),
    ]);

  if (patientError) {
    return res.status(patientError.code === 'PGRST116' ? 404 : 500).json({ error: patientError.message });
  }

  if (historyError) {
    return res.status(500).json({ error: historyError.message });
  }

  if (sessionsError) {
    return res.status(500).json({ error: sessionsError.message });
  }

  return res.json({
    currentPrice: (patient as { session_price: number | null }).session_price,
    priceHistory: ((priceHistory || []) as PriceHistoryRow[]).map((item) => ({
      id: item.id,
      patientId: item.patient_id,
      price: item.price,
      startsAt: item.starts_at,
      endsAt: item.ends_at || '',
      createdAt: item.created_at,
    })),
    sessions: ((sessions || []) as SessionFinanceRow[]).map((item) => {
      return {
        id: item.id,
        title: item.title || '',
        startsAt: item.starts_at,
        status: item.status || 'scheduled',
        sessionPrice: item.session_price,
        paymentStatus: item.payment_status || 'pending',
        paymentMethod: item.payment_method || '',
        paidAt: item.paid_at || '',
        paidAmount: item.payment_status === 'paid' ? item.paid_amount ?? item.session_price : item.paid_amount,
      };
    }),
  });
});

export default router;
