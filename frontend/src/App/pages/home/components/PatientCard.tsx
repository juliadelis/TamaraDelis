
import { FiCheck, FiX } from 'react-icons/fi';
import {
  STATUS_ACCENT_COLOR,
  STATUS_COLORS,
STATUS_ACCENT_COLOR_BORDER,
  STATUS_LABEL,
  STATUS_TEXT_COLOR,
  type Patient,
} from '../../../../shared/models/types';

interface PatientCardProps {
  patient: Patient;
}

const statusActionClasses = {
  pending: 'bg-transparent border-[#1e1e1e] text-[#1e1e1e]',
  rescheduled: 'bg-[#EDE8F9] border-[#9647FF] text-[#9647FF]',
  present: 'border-[#2BA64B] bg-[#E0F5E4] text-[#2BA64B]',
  absent: 'border-[#E10415] bg-[#FEE4E6] text-[#E10415]',
};

export const PatientCard = ({ patient }: PatientCardProps) => {
  const showBothButtons = patient.status === 'pending' || patient.status === 'rescheduled';
  const onlyPresent = patient.status === 'present';
  const onlyAbsent = patient.status === 'absent';

  return (
    <div
      className={`border border-[#A35E24] w-full  border-l rounded-md overflow-hidden mb-4 shadow-sm bg-white ${STATUS_ACCENT_COLOR[patient.status] ? '' : ''}`}
      style={{ borderLeftColor: STATUS_ACCENT_COLOR[patient.status] }}
    >
      <div className="flex items-center gap-4 py-2 px-3 ">
        <div className={`relative flex h-15 w-18 items-center justify-center border-l-4 rounded-md ${STATUS_ACCENT_COLOR_BORDER[patient.status]} ${STATUS_COLORS[patient.status]}`}>
          <div
            className={`absolute left-0 top-0 h-full w-1.5 rounded-md rounded-br-xl `}
            style={{ backgroundColor: STATUS_ACCENT_COLOR[patient.status], borderLeftColor: STATUS_ACCENT_COLOR[patient.status] }}
          />
          <span className="text-[18px] font-semibold text-[#1e1e1e]">{patient.time}</span>
        </div>

        <div className="flex-1 min-w-0 text-left">
          <h3 className="text-[16px] font-semibold text-[#1e1e1e] truncate">{patient.name}</h3>
          <p className={`mt-1 text-sm font-semibold ${STATUS_TEXT_COLOR[patient.status]}`}>
            {STATUS_LABEL[patient.status]}
          </p>
          {patient.details && (
            <button className={`mt-1 text-sm underline color-[#1e1e1e]`}>
              {patient.details}
            </button>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {showBothButtons && (
            <>
              <button
                type="button"
                className={`flex h-8 w-8 items-center justify-center rounded-full border ${statusActionClasses[patient.status]} transition-opacity`}
                aria-label="Marcar como presente"
              >
                <FiCheck className="w-5 h-5" />
              </button>
              <button
                type="button"
                className={`flex h-8 w-8 items-center justify-center rounded-full border ${statusActionClasses[patient.status]} transition-opacity`}
                aria-label="Marcar como faltou"
              >
                <FiX className="w-5 h-5" />
              </button>
            </>
          )}

          {onlyPresent && (
            <button
              type="button"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2BA64B] bg-[#2BA64B] text-white opacity-90 cursor-not-allowed"
              aria-label="Presente"
            >
              <FiCheck className="w-5 h-5" />
            </button>
          )}

          {onlyAbsent && (
            <button
              type="button"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E10415] bg-[#E10415] text-white opacity-90 cursor-not-allowed"
              aria-label="Faltou"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
