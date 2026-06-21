import type { PatientRecord } from '../models/patient.model';
import API_URL from './api';



export async function getPatientRecord() {
  const response = await fetch(`${API_URL}/api/patients`);
  if (!response.ok) {
    throw new Error('Falha ao buscar cadastro do paciente.');
  }

  return response.json() as Promise<PatientRecord[]>;
}

export async function getPatientById(id: string) {
  const response = await fetch(`${API_URL}/api/patients/${id}`);
  if (!response.ok) {
    throw new Error('Falha ao buscar paciente.');
  }

  return response.json() as Promise<PatientRecord>;
}

export async function savePatientRecord(record: Partial<PatientRecord> & { id?: string }) {
  const isUpdate = Boolean(record.id);
  const response = await fetch(`${API_URL}/api/patients${isUpdate ? `/${record.id}` : ''}`, {
    method: isUpdate ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'Falha ao salvar paciente.');
  }

  return response.json() as Promise<PatientRecord>;
}
