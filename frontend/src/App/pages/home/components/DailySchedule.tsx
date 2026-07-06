import { GoPlusCircle } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';
import type { Patient } from '../../../../shared/models/types';
import { PatientCard } from './PatientCard';

interface DailyScheduleProps {
  patients: Patient[];
  selectedDate: Date;
  loading?: boolean;
  error?: string;
  onViewDetails?: (patientId: string) => void;
  onMarkPresent?: (patientId: string) => void;
  onMarkMissed?: (patientId: string) => void;
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getDate() === second.getDate() &&
    first.getMonth() === second.getMonth() &&
    first.getFullYear() === second.getFullYear()
  );
}

function toDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatSelectedDate(date: Date) {
  if (isSameDay(date, new Date())) {
    return 'Pacientes de hoje';
  }

  return `Pacientes de ${date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })}`;
}

export const DailySchedule = ({
  patients,
  selectedDate,
  loading = false,
  error = '',
  onViewDetails,
  onMarkPresent,
  onMarkMissed,
}: DailyScheduleProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg p-1 md:p-6 md:shadow-sm">
      <h2 className="text-xl text-left font-bold text-[#502815] mb-6">
        {formatSelectedDate(selectedDate)}
      </h2>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <p>Carregando agenda...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-[#B42318]">
          <p>{error}</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Nenhum paciente agendado para este dia</p>
        </div>
      ) : (
        <div>
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onViewDetails={onViewDetails}
              onMarkPresent={onMarkPresent}
              onMarkMissed={onMarkMissed}
            />
          ))}
        </div>
      )}

      {patients.length > 0 && !loading && !error ? (
        <button
          type="button"
          onClick={() => navigate(`/agenda/${toDateParam(selectedDate)}`)}
          className="mt-6 flex items-center gap-2 bg-[#6A3710] text-white px-4 py-3 rounded-lg font-medium hover:bg-amber-950 transition-colors"
        >
          <GoPlusCircle size={18} />
          Registrar sessão
        </button>
      ) : null}
    </div>
  );
};
