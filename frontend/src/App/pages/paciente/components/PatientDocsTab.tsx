import { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import type { PatientRecord } from '../../../../shared/models/patient.model';
import type { PatientDocument } from '../../../../shared/models/patient-document.model';
import type { PatientSession } from '../../../../shared/models/session.model';
import { deletePatientDocument, getPatientDocuments, updatePatientDocument } from '../../../../shared/services/patientDocument';
import { getSessions, updateSessionNotes } from '../../../../shared/services/session';
import { DocumentFormFields } from '../../documentos/DocumentFormFields';
import { DocumentPreview } from '../../documentos/DocumentPreview';
import { DocumentPrintStyles } from '../../documentos/DocumentPrintStyles';
import type { DocumentForm } from '../../documentos/documentTypes';

type PatientDocsTabProps = {
  patient: PatientRecord;
};

type SessionDoc = {
  kind: 'session';
  id: string;
  title: string;
  subtitle: string;
  session: PatientSession;
};

type SavedDoc = {
  kind: 'saved';
  id: string;
  title: string;
  subtitle: string;
  document: PatientDocument;
};

type DocItem = SessionDoc | SavedDoc;

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('pt-BR');
}

function formatTimeRange(session: PatientSession) {
  const start = new Date(session.startsAt);
  const end = new Date(session.endsAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return '-';
  }

  return `${start.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })} - ${end.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export function PatientDocsTab({ patient }: PatientDocsTabProps) {
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [savedDocuments, setSavedDocuments] = useState<PatientDocument[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [draft, setDraft] = useState('');
  const [editingSavedDocument, setEditingSavedDocument] = useState(false);
  const [savedDocumentDraft, setSavedDocumentDraft] = useState<DocumentForm | null>(null);
  const [savedDocumentSignature, setSavedDocumentSignature] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const docs = useMemo<DocItem[]>(() => {
    const sessionDocs: DocItem[] = sessions
      .filter((session) => session.status === 'completed' && session.notes.trim())
      .map((session) => ({
        kind: 'session',
        id: `session:${session.id}`,
        title: session.title || 'Sessao realizada',
        subtitle: formatDateTime(session.startsAt),
        session,
      }));

    const savedDocs: DocItem[] = savedDocuments.map((document) => ({
      kind: 'saved',
      id: `saved:${document.id}`,
      title: document.title || 'Documento',
      subtitle: formatDateTime(document.createdAt),
      document,
    }));

    return [...savedDocs, ...sessionDocs];
  }, [savedDocuments, sessions]);

  const selectedDoc = docs.find((doc) => doc.id === selectedKey) || docs[0] || null;

  useEffect(() => {
    const loadDocs = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sessionData, documentData] = await Promise.all([
          getSessions({ patientId: patient.id, status: 'completed' }),
          getPatientDocuments(patient.id),
        ]);
        setSessions(sessionData);
        setSavedDocuments(documentData);
      } catch (err: any) {
        setError(err?.message || 'Erro ao buscar documentos.');
      } finally {
        setLoading(false);
      }
    };

    loadDocs();
  }, [patient.id]);

  useEffect(() => {
    if (!selectedDoc) {
      setSelectedKey('');
      setDraft('');
      return;
    }

    setSelectedKey(selectedDoc.id);
    setDraft(selectedDoc.kind === 'session' ? selectedDoc.session.notes || '' : '');
    setEditingSavedDocument(false);
    setSavedDocumentDraft(selectedDoc.kind === 'saved' ? selectedDoc.document.formData : null);
    setSavedDocumentSignature(selectedDoc.kind === 'saved' ? selectedDoc.document.signatureDataUrl : '');
  }, [selectedDoc?.id]);

  const handleSave = async () => {
    if (!selectedDoc || selectedDoc.kind !== 'session') {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const saved = await updateSessionNotes(selectedDoc.session.id, draft);
      setSessions((current) => current.map((session) => (session.id === saved.id ? saved : session)));
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar documento.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleSavedDocumentFieldChange = (name: keyof DocumentForm, value: string) => {
    setSavedDocumentDraft((current) => (current ? { ...current, [name]: value } : current));
  };

  const handleSaveSavedDocument = async () => {
    if (!selectedDoc || selectedDoc.kind !== 'saved' || !savedDocumentDraft) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const title =
        savedDocumentDraft.documentType === 'personalizado'
          ? savedDocumentDraft.customTitle || 'Documento'
          : selectedDoc.document.title || selectedDoc.title;
      const updated = await updatePatientDocument(selectedDoc.document.id, {
        patientId: patient.id,
        documentType: savedDocumentDraft.documentType,
        title,
        description: savedDocumentDraft.customDescription || selectedDoc.document.description || '',
        formData: savedDocumentDraft,
        signatureDataUrl: savedDocumentSignature,
      });
      setSavedDocuments((current) => current.map((document) => (document.id === updated.id ? updated : document)));
      setEditingSavedDocument(false);
      setSelectedKey(`saved:${updated.id}`);
    } catch (err: any) {
      setError(err?.message || 'Erro ao atualizar documento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSavedDocument = async () => {
    if (!selectedDoc || selectedDoc.kind !== 'saved') {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await deletePatientDocument(selectedDoc.document.id);
      setSavedDocuments((current) => current.filter((document) => document.id !== selectedDoc.document.id));
      setSelectedKey('');
      setDeleteDialogVisible(false);
    } catch (err: any) {
      setError(err?.message || 'Erro ao apagar documento.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="rounded-md border border-[#D79A69] p-4 text-sm text-[#55422f]">
        Carregando docs...
      </p>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="rounded-md border border-[#D79A69] p-4 text-sm leading-6 text-[#55422f]">
        Nenhum doc salvo ainda. Salve um documento na pagina Documentos ou registre observacoes em uma sessao realizada.
      </div>
    );
  }

  return (
    <div className="gap-4 text-left w-full flex flex-col">
      <DocumentPrintStyles />
      <style>
        {`
          .patient-session-doc-print {
            display: none;
          }

          @media print {
            .patient-session-doc-print,
            .patient-session-doc-print * {
              visibility: visible !important;
            }

            .patient-session-doc-print {
              display: block !important;
              position: absolute;
              inset: 0 auto auto 0;
              width: 100%;
              min-height: 100vh;
              padding: 32px 40px;
              background: #ffffff;
              color: #111111;
              font-family: Arial, sans-serif;
            }

            .patient-session-doc-print-content {
              white-space: pre-wrap;
              line-height: 1.7;
            }
          }
        `}
      </style>

      <div className="overflow-hidden rounded-md border border-[#D79A69] print:hidden">
        {docs.map((doc) => (
          <button
            key={doc.id}
            type="button"
            onClick={() => setSelectedKey(doc.id)}
            className={`w-full border-b border-[#E7C7A8] px-4 py-3 text-left text-sm last:border-b-0 ${
              selectedDoc?.id === doc.id ? 'bg-[#FFF5DD] text-[#5A260F]' : 'bg-white text-[#111111]'
            }`}
          >
            <span className="block font-bold">{doc.title}</span>
            <span className="mt-1 block text-xs text-[#55422f]">
              {doc.kind === 'saved' ? 'Documento salvo' : 'Registro de sessao'} - {doc.subtitle}
            </span>
          </button>
        ))}
      </div>

      {selectedDoc?.kind === 'saved' ? (
        <div className="space-y-4">
          <div className="print:hidden rounded-md border border-[#D79A69] bg-white p-4">
            <h2 className="text-sm font-bold text-[#6A3710]">{selectedDoc.title}</h2>
            <p className="mt-1 text-sm text-[#55422f]">Salvo em {selectedDoc.subtitle}</p>
            {error ? <p className="mt-3 text-sm text-[#B42318]">{error}</p> : null}
            <div className="mt-4 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingSavedDocument((current) => !current)}
                className="rounded-md border border-[#6A3710] px-4 py-2 text-sm font-semibold text-[#6A3710] transition hover:bg-[#F5E0C6]"
              >
                {editingSavedDocument ? 'Cancelar edição' : 'Editar'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteDialogVisible(true)}
                className="rounded-md border border-[#B42318] px-4 py-2 text-sm font-semibold text-[#B42318] transition hover:bg-[#FEE4E2]"
              >
                Apagar
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                className="rounded-md border border-[#6A3710] px-4 py-2 text-sm font-semibold text-[#6A3710] transition hover:bg-[#F5E0C6]"
              >
                Exportar PDF
              </button>
            </div>
          </div>

          {editingSavedDocument && savedDocumentDraft ? (
            <div className="print:hidden rounded-md border border-[#D79A69] bg-white p-4">
              <DocumentFormFields
                form={savedDocumentDraft}
                signatureDataUrl={savedDocumentSignature}
                onSignatureChange={setSavedDocumentSignature}
                onUpdateField={handleSavedDocumentFieldChange}
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSavedDocument(false);
                    setSavedDocumentDraft(selectedDoc.document.formData);
                    setSavedDocumentSignature(selectedDoc.document.signatureDataUrl);
                  }}
                  disabled={saving}
                  className="rounded-md border border-[#6A3710] px-4 py-2 text-sm font-semibold text-[#6A3710] transition hover:bg-[#F5E0C6] disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveSavedDocument}
                  disabled={saving}
                  className="rounded-md bg-[#6A3710] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#502815] disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </div>
          ) : null}

          <DocumentPreview form={savedDocumentDraft || selectedDoc.document.formData} signatureDataUrl={savedDocumentSignature} />
        </div>
      ) : selectedDoc?.kind === 'session' ? (
        <>
          <div className="rounded-md border border-[#D79A69] bg-white p-4 print:hidden">
            <div className="mb-4">
              <h2 className="text-sm font-bold text-[#6A3710]">{selectedDoc.title}</h2>
              <p className="mt-1 text-sm text-[#55422f]">
                Consulta realizada em {formatDateTime(selectedDoc.session.startsAt)}
              </p>
              <p className="mt-1 text-sm text-[#55422f]">
                Horario: {formatTimeRange(selectedDoc.session)}
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#6A3710]">Documento editavel</span>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="min-h-72 w-full resize-y rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm leading-6 text-[#111111] outline-none focus:border-[#6A3710]"
              />
            </label>

            {error ? <p className="mt-3 text-sm text-[#B42318]">{error}</p> : null}

            <div className="mt-4 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={handleExportPdf}
                className="rounded-md border border-[#6A3710] px-4 py-2 text-sm font-semibold text-[#6A3710] transition hover:bg-[#F5E0C6]"
              >
                Exportar PDF
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-[#6A3710] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#502815] disabled:opacity-60"
              >
                {saving ? 'Salvando...' : 'Salvar documento'}
              </button>
            </div>
          </div>

          <article className="patient-session-doc-print">
            <header style={{ borderBottom: '1px solid #D8C0A3', paddingBottom: 16, marginBottom: 24 }}>
              <h1 style={{ color: '#3A1C0B', fontSize: 22, margin: 0 }}>Registro de sessao</h1>
              <p style={{ margin: '8px 0 0', fontSize: 14 }}>
                <strong>Paciente:</strong> {patient.fullName}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 14 }}>
                <strong>Data:</strong> {formatDate(selectedDoc.session.startsAt)}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 14 }}>
                <strong>Horario:</strong> {formatTimeRange(selectedDoc.session)}
              </p>
            </header>

            <section>
              <h2 style={{ color: '#3A1C0B', fontSize: 16, marginBottom: 12 }}>
                {selectedDoc.title}
              </h2>
              <div className="patient-session-doc-print-content">{draft || '-'}</div>
            </section>
          </article>
        </>
      ) : null}

      <Dialog
        header="Apagar documento"
        visible={deleteDialogVisible}
        onHide={() => {
          if (!saving) {
            setDeleteDialogVisible(false);
          }
        }}
        
        draggable={false}

        className="mx-4 w-full max-w-md"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteDialogVisible(false)}
              disabled={saving}
              className="rounded-md border border-[#6A3710] px-4 py-2 text-sm font-semibold text-[#6A3710] transition hover:bg-[#F5E0C6] disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeleteSavedDocument}
              disabled={saving}
              className="rounded-md bg-[#B42318] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8F1D14] disabled:opacity-60"
            >
              {saving ? 'Apagando...' : 'Apagar'}
            </button>
          </div>
        }
      >
        <p className="text-sm leading-6 text-[#31231A]">
          Tem certeza que deseja apagar este documento? Essa ação não pode ser desfeita.
        </p>
      </Dialog>
    </div>
  );
}

