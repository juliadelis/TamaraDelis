import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { IoTrashOutline } from 'react-icons/io5';
import { deletePatientRecord, getPatientById, getPatientRecord } from '../../../shared/services/patient';
import type { PatientRecord } from '../../../shared/models/patient.model';
import { PatientFinancialTab } from './components/PatientFinancialTab';
import { PatientSessionsTab } from './components/PatientSessionsTab';

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
        { label: 'Primeira consulta', value: formatDate(record.firstConsultationDate) },
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
        { label: 'Observacoes sobre setores de conflito', value: record.conflictSectorsNotes || emptyValue },
      ],
    },
    {
      title: 'Dinâmica psíquica',
      items: [
        { label: 'Estilo de personalidade', value: record.personalityStyle || emptyValue },
        { label: 'Observacoes sobre estilo de personalidade', value: record.personalityStyleNotes || emptyValue },
        { label: 'Congruência', value: selectedCongruence(record) },
        { label: 'Instâncias dominantes', value: joinValues(record.psychicDynamics?.dominantInstances) },
        { label: 'Excesso/Falta', value: joinValues(record.psychicDynamics?.excessLack) },
        { label: 'Responsabilização', value: joinValues(record.psychicDynamics?.responsibility) },
        { label: 'Pontos de ansiedade', value: record.psychicDynamics?.anxietyPoints || emptyValue },
        { label: 'Defesas primitivas', value: joinValues(record.psychicDynamics?.defenses?.primitive) },
        { label: 'Defesas intermediárias', value: joinValues(record.psychicDynamics?.defenses?.intermediate) },
        { label: 'Defesas maduras', value: joinValues(record.psychicDynamics?.defenses?.mature) },
        { label: 'Observacoes sobre dinamica psiquica', value: record.psychicDynamicsNotes || emptyValue },
      ],
    },
    {
      title: 'Análise clínica',
      items: [
        { label: 'Tipo de falso self', value: joinValues(record.clinicalAnalysis?.falseSelf) },
        { label: 'Constância do self', value: record.clinicalAnalysis?.selfConstancy || emptyValue },
        { label: 'Anotacao sobre constancia do self', value: record.clinicalAnalysis?.selfConstancyNotes || emptyValue },
        { label: 'Objeto', value: record.clinicalAnalysis?.object || emptyValue },
        { label: 'Constância objetal', value: record.clinicalAnalysis?.objectConstancy || emptyValue },
        { label: 'Anotacao sobre constancia objetal', value: record.clinicalAnalysis?.objectConstancyNotes || emptyValue },
        { label: 'Relação com a realidade', value: record.clinicalAnalysis?.realityRelation || emptyValue },
        { label: 'Apego', value: record.clinicalAnalysis?.attachment || emptyValue },
        { label: 'Observacoes sobre analise clinica', value: record.clinicalAnalysisNotes || emptyValue },
      ],
    },
    {
      title: 'Tratamento e observações',
      items: [
        { label: 'Tipo de tratamento', value: joinValues(record.treatmentType) },
        { label: 'Intervenções', value: joinValues(record.interventions) },
        { label: 'Observacoes sobre tratamento', value: record.treatmentNotes || emptyValue },
        { label: 'Significantes S1', value: record.significants || emptyValue },
        { label: 'Estrutura da fantasia', value: record.fantasyStructure || emptyValue },
        { label: 'Transferência', value: record.transference || emptyValue },
        { label: 'Sentimento contratransferencial', value: record.countertransference || emptyValue },
      ],
    },
  ];
}

function PatientHeader({
  record,
  onDeleteClick,
}: {
  record: PatientRecord | null;
  onDeleteClick: () => void;
}) {
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
      <div className="border-b border-[#D79A69] px-4 py-5">
        <Link
          to={`/pacientes/${record.id}/editar`}
          className="inline-flex w-full items-center justify-center rounded-md bg-[#6A3710] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#502815] sm:w-auto"
        >
          Editar prontuário
        </Link>
      </div>
     
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

     
    </div>
  );
}

export const PacienteDetalhe = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('Prontuário');
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeletePatient = async () => {
    if (!record) {
      return;
    }

    setDeleting(true);
    try {
      await deletePatientRecord(record.id);
      setDeleteDialogVisible(false);
      navigate('/pacientes');
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="">
      <div className="mx-auto bg-white  text-left sm:max-w-2xl">
        <PatientHeader record={record} onDeleteClick={() => setDeleteDialogVisible(true)} />

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
            record ? (
              <PatientSessionsTab patient={record} />
            ) : (
              <div className="rounded-md border border-[#C8793D] p-5 text-sm text-[#55422f]">
                Nenhum paciente encontrado para listar sessões.
              </div>
            )
          ) : activeTab === 'Financeiro' ? (
            record ? (
              <PatientFinancialTab patient={record} />
            ) : (
              <div className="rounded-md border border-[#C8793D] p-5 text-sm text-[#55422f]">
                Nenhum paciente encontrado para listar financeiro.
              </div>
            )
          ) : (
            <ProntuarioView record={record} />
          )}
        </div>
      </div>

      <Dialog
        header="Excluir paciente"
        visible={deleteDialogVisible}
        onHide={() => {
          if (!deleting) {
            setDeleteDialogVisible(false);
          }
        }}
        modal
        className="mx-4 w-full max-w-md"
        draggable={false}
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setDeleteDialogVisible(false)}
              className="rounded-md border border-[#6A3710] px-4 py-2 text-sm font-semibold text-[#6A3710] transition hover:bg-[#F5E0C6] disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeletePatient}
              className="rounded-md bg-[#B42318] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8F1D14] disabled:opacity-60"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        }
      >
        <p className="text-sm leading-6 text-[#31231A]">
          Tem certeza que deseja excluir {record?.fullName || 'este paciente'}? Essa ação não pode ser desfeita.
        </p>
      </Dialog>
    </div>
  );
};
