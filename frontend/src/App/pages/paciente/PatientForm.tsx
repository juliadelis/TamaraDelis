import { useEffect, useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { savePatientRecord } from '../../../shared/services/patient';
import type { ConflictSectors } from '../../../shared/models/types';
import { IoAddCircleOutline, IoPersonCircleOutline, IoSearch } from 'react-icons/io5';
import { LuBrain, LuSwords } from 'react-icons/lu';
import { PiPillFill } from 'react-icons/pi';
import { CgNotes } from 'react-icons/cg';
import { BsPersonVcard } from 'react-icons/bs';
import { Divider } from 'primereact/divider';
import type { PatientRecord } from '../../../shared/models/patient.model';

interface PatientFormProps {
  record: PatientRecord | null;
  onSave: (saved: PatientRecord) => void;
}

const initialFormState: Partial<PatientRecord> = {
  fullName: '',
  cpf: '',
  birthDate: '',
  gender: '',
  maritalStatus: '',
  profession: '',
  fatherName: '',
  motherName: '',
  siblings: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  mainComplaint: '',
  nextSession: '',
  lastSession: '',
  monthlySessions: '',
  frequentTags: [],
  generalNotes: '',
  sessionNumber: '',
  sessionDate: '',
  sessionTheme: '',
  sessionMotives: '',
  conflictSectors: {
    family: { internal: false, external: false },
    social: { internal: false, external: false },
    organic: { internal: false, external: false },
    work: { internal: false, external: false },
    relationship: { internal: false, external: false },
  },
  personalityStyle: '',
  psychicDynamics: {
    congruence: [],
    dominantInstances: [],
    excessLack: [],
    responsibility: [],
    anxietyPoints: '',
    defenses: { primitive: [], intermediate: [], mature: [] },
  },
  clinicalAnalysis: {
    falseSelf: [],
    selfConstancy: '',
    selfConstancyNotes: '',
    object: '',
    objectConstancy: '',
    objectConstancyNotes: '',
    realityRelation: '',
    attachment: '',
  },
  treatmentType: [],
  interventions: [],
  significants: '',
  fantasyStructure: '',
  transference: '',
  countertransference: '',
  sessionTitle: '',
};

const checkboxClass =
  "h-4 w-4 shrink-0 appearance-none rounded-[4px] border-2 border-[#6A3710] bg-white transition-colors checked:border-[#6A3710] checked:bg-[#6A3710] checked:bg-[url('data:image/svg+xml,%3Csvg_viewBox=%220_0_16_16%22_fill=%22none%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath_d=%22M3.5_8L6.7_11.2L12.8_4.8%22_stroke=%22white%22_stroke-width=%222%22_stroke-linecap=%22round%22_stroke-linejoin=%22round%22/%3E%3C/svg%3E')] checked:bg-center checked:bg-no-repeat focus:outline-none focus:ring-2 focus:ring-[#6A3710]/25";

const radioClass =
  "h-4 w-4 shrink-0 appearance-none rounded-full border-2 border-[#6A3710] bg-white transition-colors checked:border-[#6A3710] checked:bg-[radial-gradient(circle,#6A3710_45%,transparent_48%)] focus:outline-none focus:ring-2 focus:ring-[#6A3710]/25";

const patientTagOptions = [
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

export const PatientForm = ({ record, onSave }: PatientFormProps) => {
  const [formValues, setFormValues] = useState<Partial<PatientRecord>>(
    record ? record : initialFormState
  );
  const [loading, setLoading] = useState(false);
  const [constancyFieldsVisible, setConstancyFieldsVisible] = useState(() =>
    Boolean(
      record?.clinicalAnalysis?.selfConstancy ||
        record?.clinicalAnalysis?.selfConstancyNotes ||
        record?.clinicalAnalysis?.objectConstancy ||
        record?.clinicalAnalysis?.objectConstancyNotes
    )
  );

  useEffect(() => {
    if (record) {
      setFormValues(record);
      setConstancyFieldsVisible(
        Boolean(
          record.clinicalAnalysis?.selfConstancy ||
            record.clinicalAnalysis?.selfConstancyNotes ||
            record.clinicalAnalysis?.objectConstancy ||
            record.clinicalAnalysis?.objectConstancyNotes
        )
      );
    }
  }, [record]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormValues((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleConflictChange = (sector: keyof ConflictSectors, type: 'internal' | 'external') => {
    setFormValues((prev) => ({
      ...prev,
      conflictSectors: {
        ...prev.conflictSectors!,
        [sector]: {
          ...prev.conflictSectors![sector],
          [type]: !prev.conflictSectors![sector][type],
        },
      },
    }));
  };

  const handleMultiCheckbox = (field: string, value: string) => {
    setFormValues((prev) => {
      const current = ((prev as any)[field] || []) as string[];
      if (current.includes(value)) {
        return {
          ...prev,
          [field]: current.filter((v) => v !== value),
        };
      } else {
        return {
          ...prev,
          [field]: [...current, value],
        };
      }
    });
  };

  const handlePatientTagToggle = (tag: string) => {
    setFormValues((prev) => {
      const current = prev.frequentTags || [];
      return {
        ...prev,
        frequentTags: current.includes(tag)
          ? current.filter((item) => item !== tag)
          : [...current, tag],
      };
    });
  };

  const handlePatientTagsTextChange = (value: string) => {
    setFormValues((prev) => ({
      ...prev,
      frequentTags: value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    }));
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);

    const submitData: PatientRecord = {
      id: record?.id || '',
      fullName: formValues.fullName || '',
      cpf: formValues.cpf || '',
      birthDate: formValues.birthDate || '',
      gender: formValues.gender || '',
      maritalStatus: formValues.maritalStatus || '',
      profession: formValues.profession || '',
      fatherName: formValues.fatherName || '',
      motherName: formValues.motherName || '',
      siblings: formValues.siblings || '',
      phone: formValues.phone || '',
      email: formValues.email || '',
      address: formValues.address || '',
      city: formValues.city || '',
      state: formValues.state || '',
      postalCode: formValues.postalCode || '',
      mainComplaint: formValues.mainComplaint || '',
      nextSession: formValues.nextSession || '',
      lastSession: formValues.lastSession || '',
      monthlySessions: formValues.monthlySessions || '',
      frequentTags: formValues.frequentTags || [],
      generalNotes: formValues.generalNotes || '',
      sessionNumber: formValues.sessionNumber || '',
      sessionDate: formValues.sessionDate || '',
      sessionTheme: formValues.sessionTheme || '',
      sessionMotives: formValues.sessionMotives || '',
      conflictSectors: formValues.conflictSectors || initialFormState.conflictSectors!,
      personalityStyle: formValues.personalityStyle || '',
      psychicDynamics: formValues.psychicDynamics || initialFormState.psychicDynamics!,
      clinicalAnalysis: formValues.clinicalAnalysis || initialFormState.clinicalAnalysis!,
      treatmentType: formValues.treatmentType || [],
      interventions: formValues.interventions || [],
      significants: formValues.significants || '',
      fantasyStructure: formValues.fantasyStructure || '',
      transference: formValues.transference || '',
      countertransference: formValues.countertransference || '',
      sessionTitle: formValues.sessionTitle || '',
      createdAt: record?.createdAt || new Date().toISOString(),
    };

    const saved = await savePatientRecord(submitData);
    if (saved) {
      setFormValues(saved);
      onSave(saved);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-left">
      {/* INFORMAÇÕES DO PACIENTE
      <div className="">
        <div className="mb-6 flex items-center gap-1">
         <IoInformationCircleOutline size={24} color='#6A3710' />
          <h2 className="text-lg font-semibold text-[#6A3710]">Informações do Paciente</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Nome</span>
            <input
              name="fullName"
              value={formValues.fullName || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Nome completo"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Data de Início</span>
            <input
              name="nextSession"
              value={formValues.nextSession || ''}
              onChange={handleChange}
              type="date"
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Número da Sessão</span>
            <input
              name="sessionNumber"
              value={formValues.sessionNumber || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="1"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Data da Sessão</span>
            <input
              name="sessionDate"
              value={formValues.sessionDate || ''}
              onChange={handleChange}
              type="date"
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Tema da Sessão</span>
            <input
              name="sessionTheme"
              value={formValues.sessionTheme || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Tema"
            />
          </label>
        </div>

        <div className="mt-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Motivo e/ou Pontos Importantes da Sessão</span>
            <textarea
              name="sessionMotives"
              value={formValues.sessionMotives || ''}
              onChange={handleChange}
              className="min-h-32 w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Descreva os motivos e pontos importantes"
            />
          </label>
        </div>

        <div className="mt-5 space-y-3">
          <span className="block text-sm font-medium text-[#6A3710]">Tags do paciente</span>
          <div className="flex flex-wrap gap-2">
            {patientTagOptions.map((tag) => {
              const selected = (formValues.frequentTags || []).includes(tag);

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handlePatientTagToggle(tag)}
                  className={`min-h-8 rounded-md px-3 text-xs font-semibold transition ${
                    selected
                      ? 'bg-[#6A3710] text-white'
                      : 'border border-[#D8C0A3] bg-[#FFF8ED] text-[#6A3710] hover:bg-[#F5E0C6]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Outras tags</span>
            <input
              value={(formValues.frequentTags || []).join(', ')}
              onChange={(event) => handlePatientTagsTextChange(event.target.value)}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Ansiedade, Trabalho, Família"
            />
          </label>
        </div>
      </div>
      */}

       {/* INFORMAÇÕES PESSOAIS ADICIONAIS */}
      <div className="">
        <div className="mb-6 flex items-center gap-1">
          <BsPersonVcard size={24} color='#6A3710' />
          <h2 className="text-lg font-semibold text-[#6A3710]">Informações Iniciais</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Nome</span>
            <input
              name="fullName"
              value={formValues.fullName || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Nome completo"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">CPF</span>
            <input
              name="cpf"
              value={formValues.cpf || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="000.000.000-00"
            />
          </label>
          
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Data de Nascimento</span>
            <input
              name="birthDate"
              value={formValues.birthDate || ''}
              onChange={handleChange}
              type="date"
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Gênero</span>
            <input
              name="gender"
              value={formValues.gender || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Feminino"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Estado Civil</span>
            <input
              name="maritalStatus"
              value={formValues.maritalStatus || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Solteira"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Profissão</span>
            <input
              name="profession"
              value={formValues.profession || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Profissão"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Pai</span>
            <input
              name="fatherName"
              value={formValues.fatherName || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Nome do pai"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Mãe</span>
            <input
              name="motherName"
              value={formValues.motherName || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Nome da mãe"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Irmãos</span>
            <input
              name="siblings"
              value={formValues.siblings || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Quantidade ou nomes"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Telefone</span>
            <input
              name="phone"
              value={formValues.phone || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="(11) 99999-9999"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Email</span>
            <input
              name="email"
              type="email"
              value={formValues.email || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="email@example.com"
            />
          </label>
          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-[#6A3710]">Endereço</span>
            <input
              name="address"
              value={formValues.address || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Rua, número"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Cidade</span>
            <input
              name="city"
              value={formValues.city || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="São Paulo"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Estado</span>
            <input
              name="state"
              value={formValues.state || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="SP"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">CEP</span>
            <input
              name="postalCode"
              value={formValues.postalCode || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="00000-000"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Queixa Principal</span>
            <textarea
              name="mainComplaint"
              value={formValues.mainComplaint || ''}
              onChange={handleChange}
              className="min-h-20 w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Descreva a queixa principal"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Notas Gerais</span>
            <textarea
              name="generalNotes"
              value={formValues.generalNotes || ''}
              onChange={handleChange}
              className="min-h-20 w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Notas gerais sobre o paciente"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
         
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Sessões Mensais</span>
            <input
              name="monthlySessions"
              value={formValues.monthlySessions || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="2"
            />
          </label>
        </div>

        <div className="mt-5 space-y-3">
          <span className="block text-sm font-medium text-[#6A3710]">Tags do paciente</span>
          <div className="flex flex-wrap gap-2">
            {patientTagOptions.map((tag) => {
              const selected = (formValues.frequentTags || []).includes(tag);

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handlePatientTagToggle(tag)}
                  className={`min-h-8 rounded-md px-3 text-xs font-semibold transition ${
                    selected
                      ? 'bg-[#6A3710] text-white'
                      : 'border border-[#D8C0A3] bg-[#FFF8ED] text-[#6A3710] hover:bg-[#F5E0C6]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Outras tags</span>
            <input
              value={(formValues.frequentTags || []).join(', ')}
              onChange={(event) => handlePatientTagsTextChange(event.target.value)}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Ansiedade, Trabalho, Família"
            />
          </label>
        </div>
      </div>
      <Divider /> 

      {/* SETORES DE CONFLITO */}
      <div className="">
        <div className="mb-6 flex items-center gap-1">
          <LuSwords size={24} color='#6A3710' />
          <h2 className="text-lg font-semibold text-[#6A3710]">Setores de Conflito</h2>
        </div>

        <div className="space-y-4">
          {['family', 'social', 'organic', 'work', 'relationship'].map((sector) => {
            const labels: Record<string, string> = {
              family: 'Familiar',
              social: 'Social/ Cultural',
              organic: 'Orgânico',
              work: 'Trabalho',
              relationship: 'Relacionamento',
            };

            return (
              <div key={sector}>
                <label className="mb-2 block text-sm font-medium text-[#6A3710]">{labels[sector]}</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formValues.conflictSectors?.[sector as keyof ConflictSectors]?.internal || false}
                      onChange={() => handleConflictChange(sector as keyof ConflictSectors, 'internal')}
                      className={checkboxClass}
                    />
                    <span className="text-sm text-[#6A3710]">Conflito Interno</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formValues.conflictSectors?.[sector as keyof ConflictSectors]?.external || false}
                      onChange={() => handleConflictChange(sector as keyof ConflictSectors, 'external')}
                      className={checkboxClass}
                    />
                    <span className="text-sm text-[#6A3710]">Conflito Externo</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
 <Divider />
      {/* ESTILO DE PERSONALIDADE */}
      <div className="">
        <div className="mb-6 flex items-center gap-1">
         <IoPersonCircleOutline size={24} color='#6A3710' />
          <h2 className="text-lg font-semibold text-[#6A3710]">Estilo de Personalidade</h2>
        </div>

        <div className="flex gap-6 flex-wrap">
          {[
            { value: 'esquizoide', label: 'Esquizoide/Persecutório' },
            { value: 'dramatico', label: 'Dramático/Manipulador' },
            { value: 'inibido', label: 'Inibido/Ansioso' },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2">
              <input
                type="radio"
                name="personalityStyle"
                value={option.value}
                checked={formValues.personalityStyle === option.value}
                onChange={handleChange}
                className={radioClass}
              />
              <span className="text-sm text-[#6A3710]">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
 <Divider />
      {/* DINÂMICA PSÍQUICA */}
      <div className="">
        <div className="mb-6 flex items-center gap-3">
          <LuBrain size={24} color='#6A3710' />
          <h2 className="text-lg font-semibold text-[#6A3710]">Dinâmica Psíquica</h2>
        </div>

        <div className="space-y-6">
          {/* Congruência */}
          <div>
            <label className="mb-3 block text-sm font-medium text-[#6A3710]">Congruência</label>
            <div className="flex gap-6 flex-wrap">
              {['Sinto', 'Demonstra', 'Comunica'].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(formValues.psychicDynamics?.congruence || []).some((c) => c.label === item && c.selected)}
                    onChange={() => {
                      const congruence = formValues.psychicDynamics?.congruence || [];
                      const index = congruence.findIndex((c) => c.label === item);
                      if (index >= 0) {
                        congruence[index].selected = !congruence[index].selected;
                      } else {
                        congruence.push({ label: item, selected: true });
                      }
                      setFormValues((prev) => ({
                        ...prev,
                        psychicDynamics: {
                          ...prev.psychicDynamics!,
                          congruence,
                        },
                      }));
                    }}
                    className={checkboxClass}
                  />
                  <span className="text-sm text-[#6A3710]">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Predomínio Instâncias */}
          <div>
            <label className="mb-3 block text-sm font-medium text-[#6A3710]">Predomínio Instâncias</label>
            <div className="flex gap-6 flex-wrap">
              {['Rígido', 'Flexível'].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="dominantInstances"
                    value={item}
                    checked={formValues.psychicDynamics?.dominantInstances?.includes(item)}
                    onChange={(e) => {
                      setFormValues((prev) => ({
                        ...prev,
                        psychicDynamics: {
                          ...prev.psychicDynamics!,
                          dominantInstances: [e.target.value],
                        },
                      }));
                    }}
                    className={radioClass}
                  />
                  <span className="text-sm text-[#6A3710]">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Excesso/Falta */}
          <div>
            <label className="mb-3 block text-sm font-medium text-[#6A3710]">Excesso/Falta</label>
            <div className="flex gap-6 flex-wrap">
              {['Id', 'Ego', 'Superego'].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="excessLack"
                    value={item}
                    checked={formValues.psychicDynamics?.excessLack?.includes(item)}
                    onChange={(e) => {
                      setFormValues((prev) => ({
                        ...prev,
                        psychicDynamics: {
                          ...prev.psychicDynamics!,
                          excessLack: [e.target.value],
                        },
                      }));
                    }}
                    className={radioClass}
                  />
                  <span className="text-sm text-[#6A3710]">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Responsabilização */}
          <div>
            <label className="mb-3 block text-sm font-medium text-[#6A3710]">Responsabilização</label>
            <div className="flex gap-6 flex-wrap">
              {['Si mesmo (Depressivo)', 'Outro (Paranoico)', 'Capacidade de Retificação Subjetiva'].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="responsibility"
                    value={item}
                    checked={formValues.psychicDynamics?.responsibility?.includes(item)}
                    onChange={(e) => {
                      setFormValues((prev) => ({
                        ...prev,
                        psychicDynamics: {
                          ...prev.psychicDynamics!,
                          responsibility: [e.target.value],
                        },
                      }));
                    }}
                    className={radioClass}
                  />
                  <span className="text-sm text-[#6A3710]">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pontos de Ansiedade */}
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Pontos de Ansiedade</span>
            <textarea
              name="anxietyPoints"
              value={formValues.psychicDynamics?.anxietyPoints || ''}
              onChange={(e) => {
                setFormValues((prev) => ({
                  ...prev,
                  psychicDynamics: {
                    ...prev.psychicDynamics!,
                    anxietyPoints: e.target.value,
                  },
                }));
              }}
              className="min-h-24 w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Descreva os pontos de ansiedade"
            />
          </label>

          {/* Defesas Egóicas */}
          <div>
            <label className="mb-3 block text-sm font-medium text-[#6A3710]">Defesas Egóicas</label>
            <div className="grid gap-4 md:grid-cols-3">
              {['primitive', 'intermediate', 'mature'].map((type) => {
                const defensesOptions: Record<string, string[]> = {
                  primitive: ['Cisão', 'Identificação projetiva', 'Projeção', 'Negação', 'Dissociação', 'Idealização', 'Atuação', 'Somatização', 'Regressão', 'Fantasia esquizóide'],
                  intermediate: ['Introjeção', 'Identificação', 'Deslocamento', 'Intelectualização', 'Isolamento afetivo', 'Racionalização', 'Sexualização', 'Formação reativa', 'Repressão', 'Anulação'],
                  mature: ['Humor', 'Supressão', 'Ascetismo', 'Altruísmo', 'Antecipação', 'Sublimação'],
                };

                const typeLabels: Record<string, string> = {
                  primitive: 'Primitivas',
                  intermediate: 'Intermediárias',
                  mature: 'Maduras',
                };

                return (
                  <div key={type} className="">
                    <p className="mb-2 font-medium text-[#6A3710]">{typeLabels[type]}</p>
                    <div className="space-y-2">
                      {defensesOptions[type].map((defense) => (
                        <label key={defense} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={(formValues.psychicDynamics?.defenses?.[type as 'primitive' | 'intermediate' | 'mature'] || []).includes(defense)}
                            onChange={() => {
                              setFormValues((prev) => {
                                const current = prev.psychicDynamics?.defenses?.[type as 'primitive' | 'intermediate' | 'mature'] || [];
                                return {
                                  ...prev,
                                  psychicDynamics: {
                                    ...prev.psychicDynamics!,
                                    defenses: {
                                      ...prev.psychicDynamics?.defenses!,
                                      [type]: current.includes(defense) ? current.filter((d) => d !== defense) : [...current, defense],
                                    },
                                  },
                                };
                              });
                            }}
                            className={checkboxClass}
                          />
                          <span className="text-sm text-[#6A3710]">{defense}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
       <Divider />

      {/* ANÁLISE CLÍNICA */}
      <div className="">
        <div className="mb-6 flex items-center gap-1">
          <IoSearch size={24} color='#6A3710' />
          <h2 className="text-lg font-semibold text-[#6A3710]">Análise Clínica</h2>
        </div>

        <div className="space-y-6">
          {/* Tipo de Falso Self */}
          <div>
            <label className="mb-3 block text-sm font-medium text-[#6A3710]">Tipo de Falso Self</label>
            <div className="space-y-2">
              {[
                'Falso Self como máscara social saudável',
                'Falso Self que protege o verdadeiro self',
                'Falso Self que imita e apresenta um self ideal',
                'Falso Self que dissocia a verdadeiro self',
                'Falso Self Patológico extremo',
              ].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(formValues.clinicalAnalysis?.falseSelf || []).includes(item)}
                    onChange={() => {
                      const falseSelf = formValues.clinicalAnalysis?.falseSelf || [];
                      setFormValues((prev) => ({
                        ...prev,
                        clinicalAnalysis: {
                          ...prev.clinicalAnalysis!,
                          falseSelf: falseSelf.includes(item) ? falseSelf.filter((f) => f !== item) : [...falseSelf, item],
                        },
                      }));
                    }}
                    className={checkboxClass}
                  />
                  <span className="text-sm text-[#6A3710]">{item}</span>
                </label>
              ))}
            </div>

            {constancyFieldsVisible ? (
              <div className="mt-4 space-y-4 rounded-md border border-[#D8C0A3] bg-[#FFF8ED] p-4">
                <div className="grid gap-3 md:grid-cols-[minmax(0,220px)_1fr] md:items-end">
                  <div>
                    <span className="mb-3 block text-sm font-medium text-[#6A3710]">Constância do Self</span>
                    <div className="flex gap-6">
                      {['Sim', 'Não'].map((item) => (
                        <label key={item} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="selfConstancy"
                            value={item}
                            checked={formValues.clinicalAnalysis?.selfConstancy === item}
                            onChange={(e) => {
                              setFormValues((prev) => ({
                                ...prev,
                                clinicalAnalysis: {
                                  ...prev.clinicalAnalysis!,
                                  selfConstancy: e.target.value,
                                },
                              }));
                            }}
                            className={radioClass}
                          />
                          <span className="text-sm text-[#6A3710]">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-[#6A3710]">Anotação</span>
                    <input
                      value={formValues.clinicalAnalysis?.selfConstancyNotes || ''}
                      onChange={(e) => {
                        setFormValues((prev) => ({
                          ...prev,
                          clinicalAnalysis: {
                            ...prev.clinicalAnalysis!,
                            selfConstancyNotes: e.target.value,
                          },
                        }));
                      }}
                      className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
                      placeholder="Anote detalhes sobre a constância do self"
                    />
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-[minmax(0,220px)_1fr] md:items-end">
                  <div>
                    <span className="mb-3 block text-sm font-medium text-[#6A3710]">Constância Objetal</span>
                    <div className="flex gap-6">
                      {['Sim', 'Não'].map((item) => (
                        <label key={item} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="objectConstancy"
                            value={item}
                            checked={formValues.clinicalAnalysis?.objectConstancy === item}
                            onChange={(e) => {
                              setFormValues((prev) => ({
                                ...prev,
                                clinicalAnalysis: {
                                  ...prev.clinicalAnalysis!,
                                  objectConstancy: e.target.value,
                                },
                              }));
                            }}
                            className={radioClass}
                          />
                          <span className="text-sm text-[#6A3710]">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-[#6A3710]">Anotação</span>
                    <input
                      value={formValues.clinicalAnalysis?.objectConstancyNotes || ''}
                      onChange={(e) => {
                        setFormValues((prev) => ({
                          ...prev,
                          clinicalAnalysis: {
                            ...prev.clinicalAnalysis!,
                            objectConstancyNotes: e.target.value,
                          },
                        }));
                      }}
                      className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
                      placeholder="Anote detalhes sobre a constância objetal"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConstancyFieldsVisible(true)}
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-md border border-[#6A3710] px-4 text-sm font-semibold text-[#6A3710] transition hover:bg-[#F5E0C6]"
              >
                <IoAddCircleOutline size={18} />
                Adicionar constâncias
              </button>
            )}
          </div>


          {/* Objeto */}
          <div>
            <label className="mb-3 block text-sm font-medium text-[#6A3710]">Objeto</label>
            <div className="flex gap-6">
              {['Total', 'Parcial'].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="object"
                    value={item}
                    checked={formValues.clinicalAnalysis?.object === item}
                    onChange={(e) => {
                      setFormValues((prev) => ({
                        ...prev,
                        clinicalAnalysis: {
                          ...prev.clinicalAnalysis!,
                          object: e.target.value,
                        },
                      }));
                    }}
                    className={radioClass}
                  />
                  <span className="text-sm text-[#6A3710]">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Relacao com a Realidade */}
          <div>
            <label className="mb-3 block text-sm font-medium text-[#6A3710]">Relação com a Realidade</label>
            <div className="flex gap-6">
              {['Dissociada', 'Parcial', 'Total'].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="realityRelation"
                    value={item}
                    checked={formValues.clinicalAnalysis?.realityRelation === item}
                    onChange={(e) => {
                      setFormValues((prev) => ({
                        ...prev,
                        clinicalAnalysis: {
                          ...prev.clinicalAnalysis!,
                          realityRelation: e.target.value,
                        },
                      }));
                    }}
                    className={radioClass}
                  />
                  <span className="text-sm text-[#6A3710]">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Apego */}
          <div>
            <label className="mb-3 block text-sm font-medium text-[#6A3710]">Apego</label>
            <div className="flex gap-6 flex-wrap">
              {['Seguro/Autônomo', 'Inseguro que rejeita', 'Preocupado', 'Desorganizado'].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="attachment"
                    value={item}
                    checked={formValues.clinicalAnalysis?.attachment === item}
                    onChange={(e) => {
                      setFormValues((prev) => ({
                        ...prev,
                        clinicalAnalysis: {
                          ...prev.clinicalAnalysis!,
                          attachment: e.target.value,
                        },
                      }));
                    }}
                    className={radioClass}
                  />
                  <span className="text-sm text-[#6A3710]">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
 <Divider />
      {/* TRATAMENTO */}
      <div className="">
        <div className="mb-6 flex items-center gap-1">
          <PiPillFill size={24} color='#6A3710' />
          <h2 className="text-lg font-semibold text-[#6A3710]">Tratamento</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Tipo de Tratamento */}
          <div>
            <label className="mb-3 block text-sm font-medium text-[#6A3710]">Tipo de Tratamento</label>
            <div className="flex gap-6 flex-wrap">
              {['Apoio', 'Psicodinâmica', 'Psicanálise'].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(formValues.treatmentType || []).includes(item)}
                    onChange={() => handleMultiCheckbox('treatmentType', item)}
                    className={checkboxClass}
                  />
                  <span className="text-sm text-[#6A3710]">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Intervenções */}
          <div>
            <label className="mb-3 block text-sm font-medium text-[#6A3710]">Intervenções</label>
            <div className="flex gap-6 flex-wrap">
              {['Confrontativa', 'Transicional', 'Aconselhamento'].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(formValues.interventions || []).includes(item)}
                    onChange={() => handleMultiCheckbox('interventions', item)}
                    className={checkboxClass}
                  />
                  <span className="text-sm text-[#6A3710]">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
 <Divider />
      {/* OBSERVAÇÕES E SIGNIFICANTES */}
      <div className="">
        <div className="mb-6 flex items-center gap-1">
          <CgNotes size={24} color='#6A3710' />
          <h2 className="text-lg font-semibold text-[#6A3710]">Observações e Significantes</h2>
        </div>

        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Significantes S1</span>
            <textarea
              name="significants"
              value={formValues.significants || ''}
              onChange={handleChange}
              className="min-h-24 w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Descreva os significantes"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Estrutura da Fantasia</span>
            <textarea
              name="fantasyStructure"
              value={formValues.fantasyStructure || ''}
              onChange={handleChange}
              className="min-h-24 w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Descreva a estrutura da fantasia"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Transferência</span>
            <textarea
              name="transference"
              value={formValues.transference || ''}
              onChange={handleChange}
              className="min-h-24 w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Descreva a transferência"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Sentimento Contra transferencial</span>
            <textarea
              name="countertransference"
              value={formValues.countertransference || ''}
              onChange={handleChange}
              className="min-h-24 w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Descreva o sentimento contratransferencial"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#6A3710]">Título da Sessão</span>
            <input
              name="sessionTitle"
              value={formValues.sessionTitle || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-[#D8C0A3] bg-white px-4 py-3 text-sm text-[#1E1E1E] outline-none focus:border-[#6A3710]"
              placeholder="Título da sessão"
            />
          </label>
        </div>
      </div>

     

      {/* SUBMIT BUTTON */}
      <div className="flex justify-start gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#6A3710] px-8 py-3 font-medium text-white transition-colors hover:bg-[#4F2A0B] disabled:bg-gray-400"
        >
          {loading ? 'Salvando...' : 'Salvar Paciente'}
        </button>
      </div>
    </form>
  );
};
