import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PatientForm } from './PatientForm';
import { getPatientById } from '../../../shared/services/patient';
import type { PatientRecord } from '../../../shared/models/patient.model';

export const EditarProntuario = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        setRecord(patientId ? await getPatientById(patientId) : null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  const handleSave = (_saved: PatientRecord) => {
    navigate(patientId ? `/pacientes/${patientId}` : '/pacientes');
  };

  return (
    <div className="py-2">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 text-left sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#502815]">Editar prontuário</h1>
            <p className="mt-2 text-[#55422f]">
              Atualize as informações do paciente e salve para voltar ao prontuário.
            </p>
          </div>
          <Link
            to={patientId ? `/pacientes/${patientId}` : '/pacientes'}
            className="inline-flex items-center justify-center rounded-md border border-[#6A3710] px-5 py-3 text-sm font-semibold text-[#6A3710] transition hover:bg-[#F5E0C6]"
          >
            Voltar ao prontuário
          </Link>
        </div>

        <div className="rounded-[20px] border border-[#A35E24] bg-white px-5 py-3 shadow-sm">
          {loading ? (
            <p className="py-6 text-[#55422f]">Carregando prontuário...</p>
          ) : (
            <PatientForm record={record} onSave={handleSave} />
          )}
        </div>
      </div>
    </div>
  );
};
