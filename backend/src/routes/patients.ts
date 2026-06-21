import { Router } from 'express';
import { supabase } from '../services/supabaseClient';

export interface SessionConflict {
  internal: boolean;
  external: boolean;
}

export interface ConflictSectors {
  family: SessionConflict;
  social: SessionConflict;
  organic: SessionConflict;
  work: SessionConflict;
  relationship: SessionConflict;
}

export interface CongruenceItem {
  label: string;
  selected: boolean;
}

export interface PsychicDynamics {
  congruence: CongruenceItem[];
  dominantInstances: string[];
  excessLack: string[];
  responsibility: string[];
  anxietyPoints: string;
  defenses: {
    primitive: string[];
    intermediate: string[];
    mature: string[];
  };
}

export interface ClinicalAnalysis {
  falseSelf: string[];
  selfConstancy: string;
  object: string;
  objectConstancy: string;
  realityRelation: string;
  attachment: string;
}

export interface PatientRecord {
  id: string;
  fullName: string;
  cpf?: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  profession: string;
  fatherName?: string;
  motherName?: string;
  siblings?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  mainComplaint: string;
  nextSession: string;
  lastSession: string;
  monthlySessions: string;
  frequentTags: string[];
  generalNotes: string;
  createdAt: string;
  sessionNumber: string;
  sessionDate: string;
  sessionTheme: string;
  sessionMotives: string;
  conflictSectors: ConflictSectors;
  personalityStyle: string;
  psychicDynamics: PsychicDynamics;
  clinicalAnalysis: ClinicalAnalysis;
  treatmentType: string[];
  interventions: string[];
  significants: string;
  fantasyStructure: string;
  transference: string;
  countertransference: string;
  sessionTitle: string;
}

type PatientRow = {
  id: string;
  full_name: string;
  cpf: string | null;
  birth_date: string | null;
  gender: string | null;
  marital_status: string | null;
  profession: string | null;
  father_name: string | null;
  mother_name: string | null;
  siblings: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  main_complaint: string | null;
  next_session: string | null;
  last_session: string | null;
  monthly_sessions: string | null;
  frequent_tags: string[] | null;
  general_notes: string | null;
  created_at: string;
  session_number: string | null;
  session_date: string | null;
  session_theme: string | null;
  session_motives: string | null;
  conflict_sectors: ConflictSectors | null;
  personality_style: string | null;
  psychic_dynamics: PsychicDynamics | null;
  clinical_analysis: ClinicalAnalysis | null;
  treatment_type: string[] | null;
  interventions: string[] | null;
  significants: string | null;
  fantasy_structure: string | null;
  transference: string | null;
  countertransference: string | null;
  session_title: string | null;
};

const router = Router();

const defaultConflictSectors: ConflictSectors = {
  family: { internal: false, external: false },
  social: { internal: false, external: false },
  organic: { internal: false, external: false },
  work: { internal: false, external: false },
  relationship: { internal: false, external: false },
};

const defaultPsychicDynamics: PsychicDynamics = {
  congruence: [],
  dominantInstances: [],
  excessLack: [],
  responsibility: [],
  anxietyPoints: '',
  defenses: { primitive: [], intermediate: [], mature: [] },
};

const defaultClinicalAnalysis: ClinicalAnalysis = {
  falseSelf: [],
  selfConstancy: '',
  object: '',
  objectConstancy: '',
  realityRelation: '',
  attachment: '',
};

function text(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function nullableDate(value: unknown) {
  const date = text(value);
  return date ? date : null;
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

function rowToPatient(row: PatientRow): PatientRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    cpf: row.cpf || '',
    birthDate: row.birth_date || '',
    gender: row.gender || '',
    maritalStatus: row.marital_status || '',
    profession: row.profession || '',
    fatherName: row.father_name || '',
    motherName: row.mother_name || '',
    siblings: row.siblings || '',
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || '',
    city: row.city || '',
    state: row.state || '',
    postalCode: row.postal_code || '',
    mainComplaint: row.main_complaint || '',
    nextSession: row.next_session || '',
    lastSession: row.last_session || '',
    monthlySessions: row.monthly_sessions || '',
    frequentTags: row.frequent_tags || [],
    generalNotes: row.general_notes || '',
    createdAt: row.created_at,
    sessionNumber: row.session_number || '',
    sessionDate: row.session_date || '',
    sessionTheme: row.session_theme || '',
    sessionMotives: row.session_motives || '',
    conflictSectors: row.conflict_sectors || defaultConflictSectors,
    personalityStyle: row.personality_style || '',
    psychicDynamics: row.psychic_dynamics || defaultPsychicDynamics,
    clinicalAnalysis: row.clinical_analysis || defaultClinicalAnalysis,
    treatmentType: row.treatment_type || [],
    interventions: row.interventions || [],
    significants: row.significants || '',
    fantasyStructure: row.fantasy_structure || '',
    transference: row.transference || '',
    countertransference: row.countertransference || '',
    sessionTitle: row.session_title || '',
  };
}

function requestToRow(body: Partial<PatientRecord>) {
  const row: Partial<PatientRow> = {
    full_name: text(body.fullName),
    cpf: text(body.cpf) || null,
    birth_date: nullableDate(body.birthDate),
    gender: text(body.gender) || null,
    marital_status: text(body.maritalStatus) || null,
    profession: text(body.profession) || null,
    father_name: text(body.fatherName) || null,
    mother_name: text(body.motherName) || null,
    siblings: text(body.siblings) || null,
    phone: text(body.phone) || null,
    email: text(body.email) || null,
    address: text(body.address) || null,
    city: text(body.city) || null,
    state: text(body.state) || null,
    postal_code: text(body.postalCode) || null,
    main_complaint: text(body.mainComplaint) || null,
    next_session: nullableDate(body.nextSession),
    last_session: nullableDate(body.lastSession),
    monthly_sessions: text(body.monthlySessions) || null,
    frequent_tags: stringArray(body.frequentTags),
    general_notes: text(body.generalNotes) || null,
    session_number: text(body.sessionNumber) || null,
    session_date: nullableDate(body.sessionDate),
    session_theme: text(body.sessionTheme) || null,
    session_motives: text(body.sessionMotives) || null,
    conflict_sectors: body.conflictSectors || defaultConflictSectors,
    personality_style: text(body.personalityStyle) || null,
    psychic_dynamics: body.psychicDynamics || defaultPsychicDynamics,
    clinical_analysis: body.clinicalAnalysis || defaultClinicalAnalysis,
    treatment_type: stringArray(body.treatmentType),
    interventions: stringArray(body.interventions),
    significants: text(body.significants) || null,
    fantasy_structure: text(body.fantasyStructure) || null,
    transference: text(body.transference) || null,
    countertransference: text(body.countertransference) || null,
    session_title: text(body.sessionTitle) || null,
  };

  if (body.id) {
    row.id = body.id;
  }

  return row;
}

router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json((data as PatientRow[]).map(rowToPatient));
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) {
    return res.status(error.code === 'PGRST116' ? 404 : 500).json({ error: error.message });
  }

  return res.json(rowToPatient(data as PatientRow));
});

router.post('/', async (req, res) => {
  if (!req.body.fullName) {
    return res.status(400).json({ error: 'Nome é obrigatório.' });
  }

  const payload = requestToRow(req.body);
  const { data, error } = await supabase.from('patients').insert(payload).select('*').single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(rowToPatient(data as PatientRow));
});

router.put('/:id', async (req, res) => {
  if (!req.body.fullName) {
    return res.status(400).json({ error: 'Nome é obrigatório.' });
  }

  const payload = requestToRow({ ...req.body, id: req.params.id });
  const { data, error } = await supabase
    .from('patients')
    .update(payload)
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error) {
    return res.status(error.code === 'PGRST116' ? 404 : 500).json({ error: error.message });
  }

  return res.json(rowToPatient(data as PatientRow));
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('patients').delete().eq('id', req.params.id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(204).send();
});

export default router;
