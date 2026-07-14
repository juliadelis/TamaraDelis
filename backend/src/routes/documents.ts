import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { supabase } from '../services/supabaseClient';

type PatientDocumentRow = {
  id: string;
  user_id: string;
  patient_id: string;
  document_type: string | null;
  title: string | null;
  description: string | null;
  form_data: Record<string, unknown> | null;
  signature_data_url: string | null;
  created_at: string;
  updated_at: string | null;
};

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function rowToDocument(row: PatientDocumentRow) {
  return {
    id: row.id,
    userId: row.user_id,
    patientId: row.patient_id,
    documentType: row.document_type || '',
    title: row.title || '',
    description: row.description || '',
    formData: row.form_data || {},
    signatureDataUrl: row.signature_data_url || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at || '',
  };
}

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const userId = (req as any).user.id as string;
  const patientId = text(req.query.patientId);

  if (!patientId) {
    return res.status(400).json({ error: 'Paciente e obrigatorio.' });
  }

  const { data, error } = await supabase
    .from('patient_documents')
    .select('*')
    .eq('user_id', userId)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json((data as PatientDocumentRow[]).map(rowToDocument));
});

router.post('/', async (req, res) => {
  const userId = (req as any).user.id as string;
  const patientId = text(req.body.patientId);

  if (!patientId) {
    return res.status(400).json({ error: 'Paciente e obrigatorio.' });
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('patient_documents')
    .insert({
      user_id: userId,
      patient_id: patientId,
      document_type: text(req.body.documentType) || null,
      title: text(req.body.title) || null,
      description: text(req.body.description) || null,
      form_data: req.body.formData || {},
      signature_data_url: text(req.body.signatureDataUrl) || null,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(rowToDocument(data as PatientDocumentRow));
});

export default router;

