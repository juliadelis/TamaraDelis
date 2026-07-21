import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoChevronForward, IoSearch } from 'react-icons/io5';
import { getPatientRecord } from '../../../shared/services/patient';
import type { PatientRecord } from '../../../shared/models/patient.model';

const fallbackTags = [
  'Ansiedade',
  'Trabalho',
  'Humor',
  'Família',
  'Casal',
  'Individual',
  'Adolescente',
  'PBO',
  'Psicanálise',
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

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

function patientInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'P';
}

function tagsText(record: PatientRecord) {
  return record.frequentTags?.filter(Boolean).join(', ') || 'Sem tags';
}

export const Paciente = () => {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [search, setSearch] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const records = await getPatientRecord();
        setPatients(records);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const availableTags = useMemo(() => {
    const registeredTags = patients.flatMap((patient) => patient.frequentTags || []);
    return Array.from(new Set([...fallbackTags, ...registeredTags].filter(Boolean)));
  }, [patients]);

  const filteredPatients = useMemo(() => {
    const searchTerm = normalize(search.trim());

    return patients.filter((patient) => {
      const patientTags = patient.frequentTags || [];
      const matchesSearch =
        !searchTerm ||
        normalize(patient.fullName.trimStart()).startsWith(searchTerm);

      const matchesTags =
        activeTags.length === 0 ||
        activeTags.some((tag) =>
          patientTags.some((patientTag) => normalize(patientTag) === normalize(tag))
        );

      return matchesSearch && matchesTags;
    });
  }, [activeTags, patients, search]);

  const toggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  };

  return (
    <div className="py-2">
      <div className="mx-auto max-w-full  bg-white  pb-5 text-left ">
        <div className="mb-5 flex items-start justify-between">
          <div className="w-full">
            <h1 className="text-left text-3xl font-semibold text-[#502815]">Buscar paciente</h1>
            <label className="relative w-full mt-2 block">
              <IoSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[#6A3710]"
                size={14}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-7 w-full border rounded-sm border-[#8B5A3C] bg-white pl-7 pr-3 text-xs text-[#111111] outline-none focus:border-[#6A3710] sm:min-w-90"
                placeholder="Digitar..."
              />
            </label>
          </div>

        </div>

        

        <div className="mb-8 flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const selected = activeTags.includes(tag);

            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`min-h-6 rounded-md px-2.5 text-[10px] font-bold transition ${
                  selected
                    ? 'bg-[#6A3710] text-white'
                    : 'bg-[#F2E3D2] text-[#6A3710] hover:bg-[#E7C9AA]'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>


<div className="mb-8">
          <Link
            to="/pacientes/novo"
            className="inline-flex min-h-8 items-center rounded-md bg-[#6A3710] px-4 text-xs font-bold text-white transition hover:bg-[#502815]"
          >
            Registrar paciente
          </Link>
        </div>
        <div className="space-y-5">
          {loading ? (
            <p className="text-xs text-[#55422f]">Carregando pacientes...</p>
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => {
              const age = calculateAge(patient.birthDate);

              return (
                <Link
                  key={patient.id}
                  to={`/pacientes/${patient.id}`}
                  className="grid grid-cols-[32px_1fr_24px] items-center gap-3 text-[#111111] transition hover:text-[#6A3710]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6A3710] text-xs font-bold text-white">
                    {patientInitial(patient.fullName)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{patient.fullName}</span>
                    <span className="block truncate text-[10px] text-[#111111]">
                      {age ? `${age} - ` : ''}
                      {tagsText(patient)}
                    </span>
                  </span>
                  <IoChevronForward size={18} className="justify-self-end text-[#6A3710]" />
                </Link>
              );
            })
          ) : (
            <p className="text-xs text-[#55422f]">
              Nenhum paciente encontrado com os filtros selecionados.
            </p>
          )}
        </div>

        
      </div>
    </div>
  );
};
