import { useEffect, useState } from 'react';
import type { PatientFinancialSummary } from '../../../../shared/models/finance.model';
import type { PatientRecord } from '../../../../shared/models/patient.model';
import { getPatientFinancialSummary } from '../../../../shared/services/finance';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFinancial = async () => {
      setLoading(true);
      setError('');
      try {
        setSummary(await getPatientFinancialSummary(patient.id));
      } catch (err: any) {
        setError(err?.message || 'Erro ao carregar financeiro.');
      } finally {
        setLoading(false);
      }
    };

    loadFinancial();
  }, [patient.id]);

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
              <div
                key={session.id}
                className={`grid grid-cols-4 px-3 py-2 text-xs text-[#111111] ${
                  index % 2 === 0 ? 'bg-[#FFF8ED]' : 'bg-white'
                }`}
              >
                <span>{formatDate(session.startsAt)}</span>
                <span>{formatCurrency(session.sessionPrice)}</span>
                <span className={session.paymentStatus === 'paid' ? 'font-semibold text-[#2BA64B]' : 'text-[#8A6A4F]'}>
                  {session.paymentStatus === 'paid' ? formatCurrency(session.paidAmount) : '-'}
                </span>
                <span>{session.paymentStatus === 'paid' ? formatPaymentMethod(session.paymentMethod) : '-'}</span>
              </div>
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
    </div>
  );
}
