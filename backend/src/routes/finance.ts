import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { supabase } from '../services/supabaseClient';

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
  status: string | null;
  session_price: number | null;
  paid_amount: number | null;
  patients?: {
    full_name: string | null;
  } | null;
};

const router = Router();

router.use(requireAuth);

router.get('/monthly', async (req, res) => {
  const userId = (req as any).user.id as string;
  const year = Number(req.query.year);
  const month = Number(req.query.month);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return res.status(400).json({ error: 'Mes e ano sao obrigatorios.' });
  }

  const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)).toISOString();
  const to = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)).toISOString();

  const { data, error } = await supabase
    .from('patient_sessions')
    .select('id, patient_id, starts_at, status, session_price, paid_amount, patients(full_name)')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .is('deleted_at', null)
    .gte('starts_at', from)
    .lt('starts_at', to)
    .order('starts_at', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const patients = new Map<string, { patientId: string; patientName: string; received: number; sessions: number }>();

  ((data || []) as unknown as MonthlySessionFinanceRow[]).forEach((session) => {
    const patientId = session.patient_id || 'sem-paciente';
    const current = patients.get(patientId) || {
      patientId,
      patientName: session.patients?.full_name || 'Paciente sem nome',
      received: 0,
      sessions: 0,
    };

    current.received += Number(session.paid_amount ?? session.session_price ?? 0);
    current.sessions += 1;
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
    totalSessions: patientTotals.reduce((total, patient) => total + patient.sessions, 0),
  });
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
        .select('id, starts_at, title, status, session_price, payment_status, paid_at, paid_amount')
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
      const isCompleted = item.status === 'completed';

      return {
        id: item.id,
        title: item.title || '',
        startsAt: item.starts_at,
        status: item.status || 'scheduled',
        sessionPrice: item.session_price,
        paymentStatus: isCompleted ? 'paid' : item.payment_status || 'pending',
        paidAt: item.paid_at || '',
        paidAmount: isCompleted ? item.paid_amount ?? item.session_price : item.paid_amount,
      };
    }),
  });
});

export default router;
