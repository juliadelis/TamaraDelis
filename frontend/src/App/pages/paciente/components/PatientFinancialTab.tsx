import { useCallback, useEffect, useState } from 'react';
import type { PatientFinancialSummary } from '../../../../shared/models/finance.model';
import type { PatientRecord } from '../../../../shared/models/patient.model';
import type { PatientSession } from '../../../../shared/models/session.model';
import { getPatientFinancialSummary } from '../../../../shared/services/finance';
import { deleteSession, getSession, type DeleteSessionScope } from '../../../../shared/services/session';
import { SessionDetailsDialog } from '../../agenda/components/SessionDetailsDialog';
import { SessionFormDialog } from './SessionFormDialog';

type PatientFinancialTabProps = {
  patient: PatientRecord;
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatCurrency(value: number | null) {
  return value === null || Number.isNaN(value) ? '-' : currencyFormatter.format(value);
}

function formatDate(value = '') {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
}

function formatPaymentMethod(value = '') {
  if (value === 'pix') return 'Pix';
  if (value === 'cash') return 'Dinheiro';
  return '-';
}

export function PatientFinancialTab({ patient }: PatientFinancialTabProps) {
  const [summary, setSummary] = useState<PatientFinancialSummary | null>(null);
  const [selectedSession, setSelectedSession] = useState<PatientSession | null>(null);
  const [editingSession, setEditingSession] = useState<PatientSession | null>(null);
  const [loadingSessionId, setLoadingSessionId] = useState('');
  const [deletingSession, setDeletingSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadFinancial = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setSummary(await getPatientFinancialSummary(patient.id));
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar financeiro.');
    } finally {
      setLoading(false);
    }
  }, [patient.id]);

  useEffect(() => {
    loadFinancial();
  }, [loadFinancial]);

  const handleOpenSessionDetails = async (sessionId: string) => {
    setLoadingSessionId(sessionId);
    setError('');
    try {
      setSelectedSession(await getSession(sessionId));
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar detalhes da sessao.');
    } finally {
      setLoadingSessionId('');
    }
  };

  const handleSessionSaved = async (session: PatientSession) => {
    setSelectedSession(session);
    setEditingSession(null);
    await loadFinancial();
  };

  const handleDeleteSession = async (scope: DeleteSessionScope = 'single') => {
    if (!selectedSession) return;

    setDeletingSession(true);
    try {
      await deleteSession(selectedSession.id, Boolean(selectedSession.googleEventId), scope);
      setSelectedSession(null);
      await loadFinancial();
    } catch (err: any) {
      setError(err?.message || 'Erro ao excluir sessao.');
    } finally {
      setDeletingSession(false);
    }
  };

  if (loading) {
    return (
      <p className="rounded-md border border-[#D79A69] p-4 text-sm text-[#55422f]">
        Carregando financeiro...
      </p>
    );
  }

  if (error) {
    return (
      <p className="rounded-md border border-[#B42318] bg-[#FEE4E2] p-4 text-sm text-[#B42318]">
        {error}
      </p>
    );
  }

  const sessions = summary?.sessions || [];
  const priceHistory = summary?.priceHistory || [];

  return (
    <div className="space-y-6 text-left">
     

      <section>
       
        {sessions.length === 0 ? (
          <p className="rounded-md border border-[#D79A69] p-4 text-sm text-[#55422f]">
            Nenhuma sessão encontrada para este paciente.
          </p>
        ) : (
          <div className="overflow-hidden rounded-sm">
            <div className="grid grid-cols-4 bg-white px-3 py-2 text-xs font-bold text-[#111111]">
              <span>Data</span>
              <span>Valor</span>
              <span>Pago</span>
              <span>Metodo</span>
            </div>
            {sessions.map((session, index) => (
              <button
                key={session.id}
                type="button"
                onClick={() => handleOpenSessionDetails(session.id)}
                disabled={loadingSessionId === session.id}
                className={`grid w-full grid-cols-4 px-3 py-2 text-left text-xs text-[#111111] transition hover:bg-[#F5E0C6] disabled:cursor-wait disabled:opacity-70 ${
                  index % 2 === 0 ? 'bg-[#FFF8ED]' : 'bg-white'
                }`}
                aria-label={`Ver detalhes da sessao de ${formatDate(session.startsAt)}`}
              >
                <span>{loadingSessionId === session.id ? 'Carregando...' : formatDate(session.startsAt)}</span>
                <span>{formatCurrency(session.sessionPrice)}</span>
                <span className={session.paymentStatus === 'paid' ? 'font-semibold text-[#2BA64B]' : 'text-[#8A6A4F]'}>
                  {session.paymentStatus === 'paid' ? formatCurrency(session.paidAmount) : '-'}
                </span>
                <span>{session.paymentStatus === 'paid' ? formatPaymentMethod(session.paymentMethod) : '-'}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-[#111111]">Histórico de valores</h2>
        {priceHistory.length === 0 ? (
          <p className="rounded-md border border-[#D79A69] p-4 text-sm text-[#55422f]">
            Nenhum valor registrado ainda.
          </p>
        ) : (
          <div className="space-y-2">
            {priceHistory.map((item) => (
              <div key={item.id} className="rounded-md border border-[#D79A69] px-3 py-2 text-xs text-[#111111]">
                <span className="font-bold">{formatCurrency(item.price)}</span>
                <span className="ml-2 text-[#55422f]">
                  desde {formatDate(item.startsAt)}
                  {item.endsAt ? ` até ${formatDate(item.endsAt)}` : ' até agora'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <SessionDetailsDialog
        visible={Boolean(selectedSession)}
        session={selectedSession}
        deleting={deletingSession}
        onHide={() => setSelectedSession(null)}
        onEdit={() => {
          if (!selectedSession) return;
          setEditingSession(selectedSession);
          setSelectedSession(null);
        }}
        onDelete={handleDeleteSession}
        onSaved={handleSessionSaved}
      />

      {editingSession ? (
        <SessionFormDialog
          visible={Boolean(editingSession)}
          patient={patient}
          session={editingSession}
          onHide={() => setEditingSession(null)}
          onSaved={handleSessionSaved}
        />
      ) : null}
    </div>
  );
}
