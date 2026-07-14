export type DocumentType = 'atestado' | 'declaracao' | 'laudo' | 'parecer' | 'personalizado';

export type DocumentForm = {
  documentType: DocumentType;
  patientId: string;
  sessionId: string;
  patientName: string;
  patientCpf: string;
  firstConsultationDate: string;
  issueDate: string;
  appointmentDate: string;
  appointmentStart: string;
  appointmentEnd: string;
  frequency: string;
  restriction: string;
  leaveDays: string;
  demandDescription: string;
  procedure: string;
  analysis: string;
  conclusion: string;
  references: string;
  subject: string;
  diagnosis: string;
  modality: string;
  customTitle: string;
  customDescription: string;
};

export const ADDRESS_LINES = [
  'Larizzate Boulevard & Offices • Andar 4 • Sala 404',
  'R. Aristides Lobo, 224 - Centro, Itapetininga - SP, 18200-185',
];

export const DOCUMENT_LABEL: Record<DocumentType, string> = {
  atestado: 'Atestado Psicológico',
  declaracao: 'Declaração de Comparecimento',
  laudo: 'Laudo Psicológico',
  parecer: 'Parecer Psicológico',
  personalizado: 'Texto personalizado',
};

export const initialForm: DocumentForm = {
  documentType: 'atestado',
  patientId: '',
  sessionId: '',
  patientName: '',
  patientCpf: '',
  firstConsultationDate: '',
  issueDate: new Date().toISOString().slice(0, 10),
  appointmentDate: '',
  appointmentStart: '',
  appointmentEnd: '',
  frequency: 'semanal',
  restriction: '',
  leaveDays: '',
  demandDescription: '',
  procedure: 'Psicoterapia individual',
  analysis: '',
  conclusion: '',
  references: '',
  subject: 'Solicitação de documento psicológico contendo informações pertinentes ao acompanhamento realizado.',
  diagnosis: '',
  modality: 'Online',
  customTitle: '',
  customDescription: '',
};
