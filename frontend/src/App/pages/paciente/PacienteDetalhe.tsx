import { lazy, Suspense, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { deletePatientRecord, getPatientById, getPatientRecord } from '../../../shared/services/patient';
import type { PatientRecord } from '../../../shared/models/patient.model';
import { PatientHeader } from './components/PatientHeader';
import { PatientSummaryTab } from './components/PatientSummaryTab';

const PatientSessionsTab = lazy(() =>
  import('./components/PatientSessionsTab').then((module) => ({
    default: module.PatientSessionsTab,
  }))
);
const PatientDocsTab = lazy(() =>
  import('./components/PatientDocsTab').then((module) => ({
    default: module.PatientDocsTab,
  }))
);
const PatientFinancialTab = lazy(() =>
  import('./components/PatientFinancialTab').then((module) => ({
    default: module.PatientFinancialTab,
  }))
);
const PatientProntuarioTab = lazy(() =>
  import('./components/PatientProntuarioTab').then((module) => ({
    default: module.PatientProntuarioTab,
  }))
);

const tabs = ['Resumo', 'Sessões', 'Docs', 'Financeiro', 'Prontuário'] as const;
type TabKey = (typeof tabs)[number];

function EmptyTabState({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-[#C8793D] p-5 text-sm text-[#55422f]">
      Nenhum paciente encontrado para listar {label}.
    </div>
  );
}

function TabLoadingState() {
  return (
    <p className="rounded-md border border-[#D79A69] p-4 text-sm text-[#55422f]">
      Carregando aba...
    </p>
  );
}

export const PacienteDetalhe = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('Resumo');
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const renderActiveTab = () => {
    if (loading) {
      return (
        <p className="rounded-md border border-[#A35E24] p-5 text-sm text-[#55422f]">
          Carregando dados do paciente...
        </p>
      );
    }

    if (activeTab === 'Resumo') {
      return <PatientSummaryTab record={record} />;
    }

    return (
      <Suspense fallback={<TabLoadingState />}>
        {activeTab === 'Sessões' ? (
          record ? <PatientSessionsTab patient={record} /> : <EmptyTabState label="sessões" />
        ) : activeTab === 'Docs' ? (
          record ? <PatientDocsTab patient={record} /> : <EmptyTabState label="docs" />
        ) : activeTab === 'Financeiro' ? (
          record ? <PatientFinancialTab patient={record} /> : <EmptyTabState label="financeiro" />
        ) : (
          <PatientProntuarioTab record={record} />
        )}
      </Suspense>
    );
  };

  return (
    <div className="">
      <div className="mx-auto bg-white text-left sm:max-w-2xl">
        <PatientHeader record={record} onDeleteClick={() => setDeleteDialogVisible(true)} />

        <div
          className="mt-6 grid border-b border-[#D79A69]"
          style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
        >
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

        <div className="mt-4">{renderActiveTab()}</div>
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
