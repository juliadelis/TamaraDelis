import { Router, type RequestHandler } from 'express';
import { requireAuth } from '../middleware/auth';
import { createAuthenticatedSupabaseClient } from '../services/supabaseClient';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const from = typeof req.query.from === 'string' ? req.query.from : '';
  const to = typeof req.query.to === 'string' ? req.query.to : '';
  if ((from && !Number.isFinite(Date.parse(from))) || (to && !Number.isFinite(Date.parse(to)))) {
    return res.status(400).json({ error: 'Período inválido.' });
  }
  try {
    const client = createAuthenticatedSupabaseClient(req.headers.authorization!.split(' ')[1]);
    let query = client.from('personal_appointments').select('*, expense:personal_expenses!expense_id(amount,category)').order('starts_at');
    if (from) query = query.gte('starts_at', from);
    if (to) query = query.lte('starts_at', to);
    const { data, error } = await query;
    if (error) throw error;
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível carregar os compromissos pessoais.' });
  }
});

const saveAppointment: RequestHandler = async (req, res) => {
  if (req.params.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id)) {
    return res.status(400).json({ error: 'Identificador inválido.' });
  }
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const startsAt = typeof body.starts_at === 'string' ? body.starts_at : '';
  const duration = body.duration_minutes;
  const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
  const amount = body.amount === undefined || body.amount === null || body.amount === '' ? null : body.amount;
  const categories = ['mercado', 'necessidades', 'eletronicos', 'assinaturas', 'roupa', 'beleza', 'presentes', 'saude', 'despesas_eventuais', 'desenvolvimento', 'transporte', 'restaurante', 'lazer', 'contas'];
  if (amount !== null && (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0 || amount > 9999999999.99 || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.0001 || !categories.includes(body.category))) {
    return res.status(400).json({ error: 'Informe um valor positivo com até duas casas decimais e selecione uma categoria.' });
  }
  if (!name || name.length > 200 || !Number.isFinite(Date.parse(startsAt)) ||
      !Number.isInteger(duration) || duration < 1 || duration > 1440 || notes.length > 10000) {
    return res.status(400).json({ error: 'Informe nome, data e horário válidos e duração entre 1 e 1440 minutos. Observação: até 10000 caracteres.' });
  }
  try {
    const client = createAuthenticatedSupabaseClient(req.headers.authorization!.split(' ')[1]);
    const { data, error } = await client.rpc('save_personal_appointment_with_expense', {
      p_id: req.params.id || null, p_name: name, p_starts_at: new Date(startsAt).toISOString(),
      p_duration_minutes: duration, p_notes: notes, p_amount: amount, p_category: amount === null ? null : body.category,
    });
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Compromisso não encontrado.' });
    return res.status(req.params.id ? 200 : 201).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível salvar o compromisso pessoal.' });
  }
};

router.post('/', saveAppointment);
router.put('/:id', saveAppointment);

router.delete('/:id', async (req, res) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id)) {
    return res.status(400).json({ error: 'Identificador inválido.' });
  }
  try {
    const client = createAuthenticatedSupabaseClient(req.headers.authorization!.split(' ')[1]);
    const { data, error } = await client.from('personal_appointments').delete().eq('id', req.params.id).select('id').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Compromisso não encontrado.' });
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Não foi possível excluir o compromisso pessoal.' });
  }
});

export default router;
