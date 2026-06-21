import { useNavigate } from 'react-router-dom';
import { PatientForm } from './PatientForm';
import type { PatientRecord } from '../../../shared/models/patient.model';



export const NovoPaciente = () => {
  const navigate = useNavigate();

  const handleSave = (_saved: PatientRecord) => {
    navigate('/pacientes');
  };

  return (
    <div className="py-2">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 text-left">
          <h1 className="text-3xl font-semibold text-[#502815]">Novo paciente</h1>
          <p className="mt-2 text-[#55422f]">
            Preencha os dados abaixo para cadastrar o paciente.
          </p>
        </div>

        <div className="rounded-[20px] border border-[#A35E24] bg-white py-3 px-5 shadow-sm">
          <PatientForm record={null} onSave={handleSave} />
        </div>
      </div>
    </div>
  );
};
