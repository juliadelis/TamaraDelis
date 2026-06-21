import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPatientById, getPatientRecord } from '../../../shared/services/patient';
import type { PatientRecord } from '../../../shared/models/patient.model';

const tabs = ['Resumo', 'Sessões', 'Financeiro', 'Prontuário'] as const;
type TabKey = (typeof tabs)[number];

type DetailItem = {
  label: string;
  value: string;
};

type DetailSection = {
  title?: string;
  items: DetailItem[];
};

const emptyValue = '-';

function formatDate(value = '') {
  if (!value) {
    return emptyValue;
  }

  const [year, month, day] = value.split('-');
  if (year && month && day) {
    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('pt-BR');
}

function formatDateTime(value = '') {
  if (!value) {
    return emptyValue;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return formatDate(value);
  }

  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
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

function joinValues(values: string[] = []) {
  return values.filter(Boolean).join(', ') || emptyValue;
}

function conflictLabel(record: PatientRecord, sector: keyof PatientRecord['conflictSectors']) {
  const value = record.conflictSectors?.[sector];
  const labels = [
    value?.internal ? 'Conflito interno' : '',
    value?.external ? 'Conflito externo' : '',
  ].filter(Boolean);

  return labels.join(', ') || emptyValue;
}

function selectedCongruence(record: PatientRecord) {
  return (
    record.psychicDynamics?.congruence
      ?.filter((item) => item.selected)
      .map((item) => item.label)
      .join(', ') || emptyValue
  );
}

function buildProntuarioSections(record: PatientRecord): DetailSection[] {
  return [
    {
      items: [
        { label: 'CPF', value: record.cpf || emptyValue },
        { label: 'Data de nascimento', value: formatDate(record.birthDate) },
        { label: 'Telefone', value: record.phone || emptyValue },
        { label: 'Email', value: record.email || emptyValue },
        { label: 'Gênero', value: record.gender || emptyValue },
        { label: 'Estado civil', value: record.maritalStatus || emptyValue },
        { label: 'Endereço', value: record.address || emptyValue },
        { label: 'CEP', value: record.postalCode || emptyValue },
      ],
    },
    {
      title: 'Histórico pregresso',
      items: [
        { label: 'Pai', value: record.fatherName || emptyValue },
        { label: 'Mãe', value: record.motherName || emptyValue },
        { label: 'Irmãos', value: record.siblings || emptyValue },
        { label: 'Profissão', value: record.profession || emptyValue },
        { label: 'Cidade de nascimento', value: record.city || emptyValue },
        { label: 'Estado', value: record.state || emptyValue },
      ],
    },
    {
      title: 'Histórico clínico',
      items: [
        { label: 'Queixa principal', value: record.mainComplaint || emptyValue },
        { label: 'Observações gerais', value: record.generalNotes || emptyValue },
        { label: 'Sessões mensais', value: record.monthlySessions || emptyValue },
        { label: 'Tags frequentes', value: joinValues(record.frequentTags) },
      ],
    },
    {
      title: 'Sessão',
      items: [
        { label: 'Número da sessão', value: record.sessionNumber || emptyValue },
        { label: 'Data da sessão', value: formatDate(record.sessionDate) },
        { label: 'Tema da sessão', value: record.sessionTheme || emptyValue },
        { label: 'Motivos e pontos importantes', value: record.sessionMotives || emptyValue },
        { label: 'Título da sessão', value: record.sessionTitle || emptyValue },
      ],
    },
    {
      title: 'Setores de conflito',
      items: [
        { label: 'Familiar', value: conflictLabel(record, 'family') },
        { label: 'Social/Cultural', value: conflictLabel(record, 'social') },
        { label: 'Orgânico', value: conflictLabel(record, 'organic') },
        { label: 'Trabalho', value: conflictLabel(record, 'work') },
        { label: 'Relacionamento', value: conflictLabel(record, 'relationship') },
      ],
    },
    {
      title: 'Dinâmica psíquica',
      items: [
        { label: 'Estilo de personalidade', value: record.personalityStyle || emptyValue },
        { label: 'Congruência', value: selectedCongruence(record) },
        { label: 'Instâncias dominantes', value: joinValues(record.psychicDynamics?.dominantInstances) },
        { label: 'Excesso/Falta', value: joinValues(record.psychicDynamics?.excessLack) },
        { label: 'Responsabilização', value: joinValues(record.psychicDynamics?.responsibility) },
        { label: 'Pontos de ansiedade', value: record.psychicDynamics?.anxietyPoints || emptyValue },
        { label: 'Defesas primitivas', value: joinValues(record.psychicDynamics?.defenses?.primitive) },
        { label: 'Defesas intermediárias', value: joinValues(record.psychicDynamics?.defenses?.intermediate) },
        { label: 'Defesas maduras', value: joinValues(record.psychicDynamics?.defenses?.mature) },
      ],
    },
    {
      title: 'Análise clínica',
      items: [
        { label: 'Tipo de falso self', value: joinValues(record.clinicalAnalysis?.falseSelf) },
        { label: 'Constância do self', value: record.clinicalAnalysis?.selfConstancy || emptyValue },
        { label: 'Objeto', value: record.clinicalAnalysis?.object || emptyValue },
        { label: 'Constância objetal', value: record.clinicalAnalysis?.objectConstancy || emptyValue },
        { label: 'Relação com a realidade', value: record.clinicalAnalysis?.realityRelation || emptyValue },
        { label: 'Apego', value: record.clinicalAnalysis?.attachment || emptyValue },
      ],
    },
    {
      title: 'Tratamento e observações',
      items: [
        { label: 'Tipo de tratamento', value: joinValues(record.treatmentType) },
        { label: 'Intervenções', value: joinValues(record.interventions) },
        { label: 'Significantes S1', value: record.significants || emptyValue },
        { label: 'Estrutura da fantasia', value: record.fantasyStructure || emptyValue },
        { label: 'Transferência', value: record.transference || emptyValue },
        { label: 'Sentimento contratransferencial', value: record.countertransference || emptyValue },
      ],
    },
  ];
}

function PatientHeader({ record }: { record: PatientRecord | null }) {
  const name = record?.fullName || 'Paciente';
  const initial = name.trim().charAt(0).toUpperCase() || 'P';
  const age = calculateAge(record?.birthDate ?? '');

  return (
    <div className="flex items-center gap-5">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#6A3710] text-2xl font-medium text-white">
        {initial}
      </div>
      <div className="min-w-0">
        <h1 className="truncate text-[22px] font-bold leading-tight text-[#111111]">
          {name}
        </h1>
        {age ? <p className="mt-2 text-[15px] text-[#111111]">{age}</p> : null}
      </div>
    </div>
  );
}

function ProntuarioView({ record }: { record: PatientRecord | null }) {
  if (!record) {
    return (
      <div className="rounded-md border border-[#A35E24] p-5 text-sm text-[#55422f]">
        Nenhum paciente cadastrado. Cadastre um paciente para visualizar o prontuário.
      </div>
    );
  }

  const sections = buildProntuarioSections(record);

  return (
    <div className="overflow-hidden rounded-md border border-[#C8793D] bg-white">
      {sections.map((section, sectionIndex) => (
        <section
          key={section.title || 'dados-pessoais'}
          className={sectionIndex > 0 ? 'border-t border-[#D79A69]' : ''}
        >
          <div className="space-y-3 px-4 py-4">
            {section.title ? (
              <h2 className="text-sm font-bold text-[#6A3710]">{section.title}</h2>
            ) : null}
            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {section.items.map((item) => (
                <p
                  key={`${section.title || 'dados'}-${item.label}`}
                  className={
                    item.value.length > 70
                      ? 'text-sm leading-6 text-[#111111] sm:col-span-2'
                      : 'text-sm leading-6 text-[#111111]'
                  }
                >
                  <span className="font-bold">{item.label}:</span> {item.value}
                </p>
              ))}
            </div>
          </div>
        </section>
      ))}

      <div className="border-t border-[#D79A69] px-4 py-5">
        <Link
          to={`/pacientes/${record.id}/editar`}
          className="inline-flex w-full items-center justify-center rounded-md bg-[#6A3710] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#502815] sm:w-auto"
        >
          Editar prontuário
        </Link>
      </div>
    </div>
  );
}

export const PacienteDetalhe = () => {
  const { patientId } = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>('Prontuário');
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const summaryFields = useMemo(
    () => [
      { label: 'Próxima sessão', value: formatDateTime(record?.nextSession ?? '') },
      { label: 'Última sessão', value: formatDateTime(record?.lastSession ?? '') },
      { label: 'Sessões mensais', value: record?.monthlySessions || emptyValue },
      { label: 'Tags frequentes', value: record?.frequentTags?.join(', ') || emptyValue },
    ],
    [record]
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (patientId) {
          setRecord(await getPatientById(patientId));
        } else {
          const records = await getPatientRecord();
          setRecord(records[0] ?? null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  return (
    <div className="py-2">
      <div className="mx-auto max-w-[370px] bg-white px-6 py-4 text-left sm:max-w-2xl">
        <PatientHeader record={record} />

        <div className="mt-6 grid grid-cols-4 border-b border-[#D79A69]">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`min-h-10 border-b-2 px-1 text-center text-[13px] transition ${
                activeTab === tab
                  ? 'border-[#6A3710] font-bold text-[#5A260F]'
                  : 'border-transparent font-medium text-[#666666] hover:text-[#5A260F]'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {loading ? (
            <p className="rounded-md border border-[#A35E24] p-5 text-sm text-[#55422f]">
              Carregando dados do paciente...
            </p>
          ) : activeTab === 'Resumo' ? (
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
          ) : activeTab === 'Sessões' ? (
            <div className="rounded-md border border-[#C8793D] p-5 text-sm text-[#55422f]">
              Esta aba ainda está vazia. Em breve será utilizada para listar sessões do paciente.
            </div>
          ) : activeTab === 'Financeiro' ? (
            <div className="rounded-md border border-[#C8793D] p-5 text-sm text-[#55422f]">
              Esta aba ainda está vazia. Em breve será utilizada para gerenciar financeiro.
            </div>
          ) : (
            <ProntuarioView record={record} />
          )}
        </div>
      </div>
    </div>
  );
};
