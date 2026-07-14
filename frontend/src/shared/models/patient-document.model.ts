import type { DocumentForm, DocumentType } from '../../App/pages/documentos/documentTypes';

export interface PatientDocument {
  id: string;
  userId: string;
  patientId: string;
  documentType: DocumentType | '';
  title: string;
  description: string;
  formData: DocumentForm;
  signatureDataUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type PatientDocumentPayload = {
  patientId: string;
  documentType: DocumentType;
  title: string;
  description: string;
  formData: DocumentForm;
  signatureDataUrl: string;
};

