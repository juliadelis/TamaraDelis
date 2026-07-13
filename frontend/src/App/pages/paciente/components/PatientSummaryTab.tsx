import type { PatientRecord } from '../../../../shared/models/patient.model';
import { emptyValue, formatDateTime } from './patientDetailFormatters';

type PatientSummaryTabProps = {
  record: PatientRecord | null;
};

export function PatientSummaryTab({ record }: PatientSummaryTabProps) {
  const summaryFields = [
    { label: 'Próxima sessão', value: formatDateTime(record?.nextSession ?? '') },
    { label: 'Última sessão', value: formatDateTime(record?.lastSession ?? '') },
    { label: 'Sessões mensais', value: record?.monthlySessions || emptyValue },
    { label: 'Tags frequentes', value: record?.frequentTags?.join(', ') || emptyValue },
  ];

  return (
    <div className="space-y-4 rounded-md border border-[#C8793D] p-4">
      <h2 className="text-sm font-bold text-[#6A3710]">Resumo do paciente</h2>
      <p className="text-sm leading-6 text-[#111111]">
        <span className="font-bold">Nome:</span> {record?.fullName || emptyValue}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {summaryFields.map((item) => (
          <p key={item.label} className="text-sm leading-6 text-[#111111]">
            <span className="font-bold">{item.label}:</span> {item.value}
          </p>
        ))}
      </div>
      <p className="text-sm leading-6 text-[#111111]">
        <span className="font-bold">Observações gerais:</span>{' '}
        {record?.generalNotes || 'Nenhuma observação cadastrada.'}
      </p>
    </div>
  );
}

