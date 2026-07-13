import { useEffect, useMemo, useState } from 'react';
import type { PatientRecord } from '../../../../shared/models/patient.model';
import type { PatientSession } from '../../../../shared/models/session.model';
import { getSessions, updateSessionNotes } from '../../../../shared/services/session';

type PatientDocsTabProps = {
  patient: PatientRecord;
};

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
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const docs = useMemo(
    () =>
      sessions
        .filter((session) => session.status === 'completed' && session.notes.trim())
        .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()),
    [sessions]
  );

  const selectedDoc = docs.find((session) => session.id === selectedId) || docs[0] || null;

  useEffect(() => {
    const loadDocs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSessions({ patientId: patient.id, status: 'completed' });
        setSessions(data);
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
      setSelectedId('');
      setDraft('');
      return;
    }

    setSelectedId(selectedDoc.id);
    setDraft(selectedDoc.notes || '');
  }, [selectedDoc?.id]);

  const handleSave = async () => {
    if (!selectedDoc) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const saved = await updateSessionNotes(selectedDoc.id, draft);
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
        Nenhum doc salvo ainda. Ao marcar uma sessao como realizada e preencher observações, ela aparece aqui.
      </div>
    );
  }

  return (
    <div className="grid gap-4 text-left lg:grid-cols-[220px_1fr]">
      <style>
        {`
          .patient-doc-print {
            display: none;
          }

          @media print {
            body * {
              visibility: hidden !important;
            }

            .patient-doc-no-print {
              display: none !important;
            }

            .patient-doc-print,
            .patient-doc-print * {
              visibility: visible !important;
            }

            .patient-doc-print {
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

            .patient-doc-print-content {
              white-space: pre-wrap;
              line-height: 1.7;
            }
          }
        `}
      </style>
      <div className="overflow-hidden rounded-md border border-[#D79A69]">
        {docs.map((doc) => (
          <button
            key={doc.id}
            type="button"
            onClick={() => setSelectedId(doc.id)}
            className={`w-full border-b border-[#E7C7A8] px-4 py-3 text-left text-sm last:border-b-0 ${
              selectedDoc?.id === doc.id ? 'bg-[#FFF5DD] text-[#5A260F]' : 'bg-white text-[#111111]'
            }`}
          >
            <span className="block font-bold">{doc.title || 'Sessao realizada'}</span>
            <span className="mt-1 block text-xs text-[#55422f]">{formatDateTime(doc.startsAt)}</span>
          </button>
        ))}
      </div>

      <div className="rounded-md border border-[#D79A69] bg-white p-4">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-[#6A3710]">
            {selectedDoc?.title || 'Sessao realizada'}
          </h2>
          <p className="mt-1 text-sm text-[#55422f]">
            Consulta realizada em {selectedDoc ? formatDateTime(selectedDoc.startsAt) : '-'}
          </p>
          <p className="mt-1 text-sm text-[#55422f]">
            Horário: {selectedDoc ? formatTimeRange(selectedDoc) : '-'}
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
            disabled={!selectedDoc}
            className="rounded-md border border-[#6A3710] px-4 py-2 text-sm font-semibold text-[#6A3710] transition hover:bg-[#F5E0C6] disabled:opacity-60"
          >
            Exportar PDF
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !selectedDoc}
            className="rounded-md bg-[#6A3710] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#502815] disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar documento'}
          </button>
        </div>
      </div>

      {selectedDoc ? (
        <article className="patient-doc-print">
          <header style={{ borderBottom: '1px solid #D8C0A3', paddingBottom: 16, marginBottom: 24 }}>
            <h1 style={{ color: '#3A1C0B', fontSize: 22, margin: 0 }}>Registro de sessao</h1>
            <p style={{ margin: '8px 0 0', fontSize: 14 }}>
              <strong>Paciente:</strong> {patient.fullName}
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 14 }}>
              <strong>Data:</strong> {formatDate(selectedDoc.startsAt)}
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 14 }}>
              <strong>Horário:</strong> {formatTimeRange(selectedDoc)}
            </p>
          </header>

          <section>
            <h2 style={{ color: '#3A1C0B', fontSize: 16, marginBottom: 12 }}>
              {selectedDoc.title || 'Sessao realizada'}
            </h2>
            <div className="patient-doc-print-content">{draft || '-'}</div>
          </section>
        </article>
      ) : null}
    </div>
  );
}
