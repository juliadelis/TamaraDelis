import type { ClinicalAnalysis, ConflictSectors, PatientStatus, PsychicDynamics } from "./types";

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

export interface Patient {
  id: string;
  name: string;
  time: string;
  status: PatientStatus;
  details?: string;
}
