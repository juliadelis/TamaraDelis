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
  starts_at: string;
  title: string | null;
  status: string | null;
  session_price: number | null;
  payment_status: string | null;
  paid_at: string | null;
  paid_amount: number | null;
};

const router = Router();

router.use(requireAuth);

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
