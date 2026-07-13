import { IoTrashOutline } from 'react-icons/io5';
import type { PatientRecord } from '../../../../shared/models/patient.model';
import { formatDate } from './patientDetailFormatters';

type PatientHeaderProps = {
  record: PatientRecord | null;
  onDeleteClick: () => void;
};

function calculateAge(value = '') {
  if (!value) {
    return '';
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  const hasNotHadBirthday =
    monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate());

  if (hasNotHadBirthday) {
    age -= 1;
  }

  return age >= 0 ? `${age} anos` : '';
}

export function PatientHeader({ record, onDeleteClick }: PatientHeaderProps) {
  const name = record?.fullName || 'Paciente';
  const initial = name.trim().charAt(0).toUpperCase() || 'P';
  const age = calculateAge(record?.birthDate ?? '');
  const firstConsultation = formatDate(record?.firstConsultationDate ?? '');

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#6A3710] text-2xl font-medium text-white">
          {initial}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-[22px] font-bold leading-tight text-[#111111]">
            {name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-[#111111]">
            {age ? <span>{age}</span> : null}
            {record?.firstConsultationDate ? (
              <span>
                <span className="font-semibold">Primeira consulta:</span> {firstConsultation}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      {record ? (
        <button
          type="button"
          onClick={onDeleteClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#B42318] text-[#B42318] transition hover:bg-[#FEE4E2]"
          aria-label="Excluir paciente"
          title="Excluir paciente"
        >
          <IoTrashOutline size={20} />
        </button>
      ) : null}
    </div>
  );
}

