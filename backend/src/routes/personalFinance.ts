import { Router, type RequestHandler } from 'express';
import { requireAuth } from '../middleware/auth';
import { createAuthenticatedSupabaseClient, supabase } from '../services/supabaseClient';

const router = Router();
router.use(requireAuth);
const categories = ['mercado', 'necessidades', 'eletronicos', 'assinaturas', 'roupa', 'beleza', 'presentes', 'saude', 'despesas_eventuais', 'desenvolvimento', 'transporte', 'restaurante', 'lazer', 'contas'];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function today() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

router.get('/', async (req, res) => {
  const year = Number(req.query.year), month = Number(req.query.month);
  if (!Number.isInteger(year) || year < 2020 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12) {
    return res.status(400).json({ error: 'Selecione mês e ano válidos (2020 a 2100).' });
  }
  const fromDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const toDate = `${month === 12 ? year + 1 : year}-${String(month === 12 ? 1 : month + 1).padStart(2, '0')}-01`;
  const from = new Date(`${fromDate}T00:00:00-03:00`).toISOString();
  const to = new Date(Math.min(Date.parse(`${toDate}T00:00:00-03:00`), Date.now() + 1)).toISOString();
  const userId = (req as typeof req & { user: { id: string } }).user.id;
  try {
    const client = createAuthenticatedSupabaseClient(req.headers.authorization!.split(' ')[1]);
    const expenses: Array<{ id: string; name: string; amount: number; category: string; spent_on: string }> = [];
    let receivedCents = 0;
    // Read every page so the Supabase row limit cannot truncate monthly totals.
    await Promise.all([
      (async () => {
        for (let offset = 0; ; offset += 1000) {
          const { data, error } = await client.from('personal_expenses').select('id,name,amount,category,spent_on')
            .gte('spent_on', fromDate).lt('spent_on', toDate).lte('spent_on', today())
            .order('spent_on', { ascending: false }).order('id').range(offset, offset + 999);
          if (error) throw error;
          expenses.push(...(data || []));
          if (!data || data.length < 1000) break;
        }
      })(),
      (async () => {
        for (let offset = 0; ; offset += 1000) {
          const { data, error } = await supabase.from('patient_sessions').select('id,paid_amount,session_price')
            .eq('user_id', userId).is('deleted_at', null).eq('payment_status', 'paid')
            .not('status', 'in', '(cancelled,rescheduled)')
            .or(`and(paid_at.gte.${from},paid_at.lt.${to}),and(paid_at.is.null,starts_at.gte.${from},starts_at.lt.${to})`)
            .order('id').range(offset, offset + 999);
          if (error) throw error;
          for (const item of data || []) receivedCents += Math.round(Number(item.paid_amount ?? item.session_price ?? 0) * 100);
          if (!data || data.length < 1000) break;
        }
      })(),
    ]);
    const spentCents = expenses.reduce((sum, item) => sum + Math.round(Number(item.amount) * 100), 0);
    return res.json({ expenses, received: receivedCents / 100, spent: spentCents / 100, balance: (receivedCents - spentCents) / 100 });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível carregar as finanças pessoais.' });
  }
});

const save: RequestHandler = async (req, res) => {
  const { name, amount, category, spent_on } = req.body || {};
  const validDate = typeof spent_on === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(spent_on) &&
    Number.isFinite(Date.parse(spent_on)) && new Date(spent_on).toISOString().slice(0, 10) === spent_on && spent_on >= '2020-01-01' && spent_on <= today();
  if ((req.params.id && !uuid.test(req.params.id)) || typeof name !== 'string' || !name.trim() || name.trim().length > 200 ||
      typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0 || amount > 9999999999.99 ||
      Math.abs(amount * 100 - Math.round(amount * 100)) > 0.0001 || !categories.includes(category) || !validDate) {
    return res.status(400).json({ error: 'Informe nome, categoria, valor positivo com até duas casas decimais e data válida até hoje.' });
  }
  try {
    const client = createAuthenticatedSupabaseClient(req.headers.authorization!.split(' ')[1]);
    const table = client.from('personal_expenses');
    const payload = { name: name.trim(), amount, category, spent_on };
    const query = req.params.id ? table.update(payload).eq('id', req.params.id) : table.insert(payload);
    const { data, error } = await query.select().maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Despesa não encontrada.' });
    return res.status(req.params.id ? 200 : 201).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível salvar a despesa.' });
  }
};
router.post('/', save);
router.put('/:id', save);
router.delete('/:id', async (req, res) => {
  if (!uuid.test(req.params.id)) return res.status(400).json({ error: 'Identificador inválido.' });
  try {
    const client = createAuthenticatedSupabaseClient(req.headers.authorization!.split(' ')[1]);
    const { data, error } = await client.from('personal_expenses').delete().eq('id', req.params.id).select('id').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Despesa não encontrada.' });
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível excluir a despesa.' });
  }
});
export default router;
