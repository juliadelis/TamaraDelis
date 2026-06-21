"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabaseClient_1 = require("../services/supabaseClient");
const router = (0, express_1.Router)();
const defaultConflictSectors = {
    family: { internal: false, external: false },
    social: { internal: false, external: false },
    organic: { internal: false, external: false },
    work: { internal: false, external: false },
    relationship: { internal: false, external: false },
};
const defaultPsychicDynamics = {
    congruence: [],
    dominantInstances: [],
    excessLack: [],
    responsibility: [],
    anxietyPoints: '',
    defenses: { primitive: [], intermediate: [], mature: [] },
};
const defaultClinicalAnalysis = {
    falseSelf: [],
    selfConstancy: '',
    object: '',
    objectConstancy: '',
    realityRelation: '',
    attachment: '',
};
function text(value) {
    return typeof value === 'string' ? value : '';
}
function nullableDate(value) {
    const date = text(value);
    return date ? date : null;
}
function stringArray(value) {
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
function rowToPatient(row) {
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
function requestToRow(body) {
    const row = {
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
    const { data, error } = await supabaseClient_1.supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    return res.json(data.map(rowToPatient));
});
router.get('/:id', async (req, res) => {
    const { data, error } = await supabaseClient_1.supabase
        .from('patients')
        .select('*')
        .eq('id', req.params.id)
        .single();
    if (error) {
        return res.status(error.code === 'PGRST116' ? 404 : 500).json({ error: error.message });
    }
    return res.json(rowToPatient(data));
});
router.post('/', async (req, res) => {
    if (!req.body.fullName) {
        return res.status(400).json({ error: 'Nome é obrigatório.' });
    }
    const payload = requestToRow(req.body);
    const { data, error } = await supabaseClient_1.supabase.from('patients').insert(payload).select('*').single();
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(rowToPatient(data));
});
router.put('/:id', async (req, res) => {
    if (!req.body.fullName) {
        return res.status(400).json({ error: 'Nome é obrigatório.' });
    }
    const payload = requestToRow({ ...req.body, id: req.params.id });
    const { data, error } = await supabaseClient_1.supabase
        .from('patients')
        .update(payload)
        .eq('id', req.params.id)
        .select('*')
        .single();
    if (error) {
        return res.status(error.code === 'PGRST116' ? 404 : 500).json({ error: error.message });
    }
    return res.json(rowToPatient(data));
});
exports.default = router;
