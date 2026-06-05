
import { GoPlusCircle } from 'react-icons/go';
import type { Patient } from '../../../../shared/models/types';
import { PatientCard } from './PatientCard';


interface DailyScheduleProps {
  patients: Patient[];
}

export const DailySchedule = ({ patients }: DailyScheduleProps) => {
  return (
    <div className="bg-white rounded-lg p-1 md:p-6 md:shadow-sm">
      <h2 className="text-xl text-left font-bold text-[#502815] mb-6">
        Pacientes de hoje
      </h2>

      {patients.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Nenhum paciente agendado para hoje</p>
        </div>
      ) : (
        <div>
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}

    
      {patients.length > 0 && (
        <button className="mt-6 flex items-center gap-2 bg-[#6A3710] text-white px-4 py-3 rounded-lg font-medium hover:bg-amber-950 transition-colors">
          <GoPlusCircle size={18} />
          Registrar sessão
        </button>
      )}
    </div>
  );
};
