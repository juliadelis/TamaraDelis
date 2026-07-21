import { useEffect, useMemo, useState } from 'react';
import { getPatientRecord } from '../../../shared/services/patient';
import { savePatientDocument } from '../../../shared/services/patientDocument';
import { getSessions } from '../../../shared/services/session';
import { PatientSelect } from '../../../shared/components/PatientSelect/PatientSelect';
import type { PatientRecord } from '../../../shared/models/patient.model';
import type { PatientSession } from '../../../shared/models/session.model';
import { DocumentFormFields } from './DocumentFormFields';
import { DocumentPreview } from './DocumentPreview';
import { DocumentPrintStyles } from './DocumentPrintStyles';
import { DOCUMENT_LABEL, initialForm } from './documentTypes';
import type { DocumentForm, DocumentType } from './documentTypes';
import { dateFromIso, formatDate, phoneForWhatsapp, timeFromIso } from './documentUtils';

export function Documentos() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [form, setForm] = useState<DocumentForm>(initialForm);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [savingDocument, setSavingDocument] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === form.patientId) || null,
    [form.patientId, patients]
  );

  useEffect(() => {
    const loadPatients = async () => {
      setLoadingPatients(true);
      try {
        setPatients(await getPatientRecord());
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPatients(false);
      }
    };

    loadPatients();
  }, []);

  useEffect(() => {
    const loadSessions = async () => {
      if (!form.patientId) {
        setSessions([]);
        return;
      }

      setLoadingSessions(true);
      try {
        setSessions(await getSessions({ patientId: form.patientId }));
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingSessions(false);
      }
    };

    loadSessions();
  }, [form.patientId]);

  const updateField = (name: keyof DocumentForm, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find((item) => item.id === patientId);
    setForm((current) => ({
      ...current,
      patientId,
      sessionId: '',
      patientName: patient?.fullName || '',
      patientCpf: patient?.cpf || '',
      patientBirthDate: patient?.birthDate || '',
      firstConsultationDate: patient?.firstConsultationDate || '',
    }));
  };

  const handleSessionChange = (sessionId: string) => {
    const session = sessions.find((item) => item.id === sessionId);
    setForm((current) => ({
      ...current,
      sessionId,
      appointmentDate: session ? dateFromIso(session.startsAt) : current.appointmentDate,
      appointmentStart: session ? timeFromIso(session.startsAt) : current.appointmentStart,
      appointmentEnd: session ? timeFromIso(session.endsAt) : current.appointmentEnd,
      demandDescription: current.demandDescription || session?.sessionMotives || '',
      subject: current.subject || session?.sessionTheme || initialForm.subject,
      diagnosis: current.diagnosis || session?.cid || '',
      reimbursementDiagnosis: current.reimbursementDiagnosis || session?.cid || '',
      firstInterviewDate: current.firstInterviewDate || (session ? dateFromIso(session.startsAt) : ''),
      firstInterviewTime: current.firstInterviewTime || (session ? timeFromIso(session.startsAt) : ''),
    }));
  };

  const documentTitle = DOCUMENT_LABEL[form.documentType];
  const shareMessage = `Olá, ${form.patientName || 'tudo bem'}! Segue o ${documentTitle.toLowerCase()} emitido em ${formatDate(form.issueDate)}. Por favor, confira o PDF em anexo.`;

  const handleWhatsappShare = () => {
    const phone = phoneForWhatsapp(selectedPatient?.phone);
    if (!phone) {
      window.alert('Este paciente não tem telefone cadastrado.');
      return;
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(shareMessage)}`, '_blank', 'noopener,noreferrer');
  };

  const handleEmailShare = () => {
    if (!selectedPatient?.email) {
      window.alert('Este paciente não tem e-mail cadastrado.');
      return;
    }

    const subject = `${documentTitle} - Tamara Delis`;
    window.location.href = `mailto:${selectedPatient.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareMessage)}`;
  };

  const handleSaveDocument = async () => {
    if (!selectedPatient) {
      window.alert('Selecione um paciente para salvar o documento.');
      return;
    }

    setSavingDocument(true);
    setSaveMessage('');
    try {
      const title = form.documentType === 'personalizado' ? form.customTitle || 'Documento' : documentTitle;
      const description =
        form.documentType === 'personalizado'
          ? form.customDescription
          : form.demandDescription || form.subject || form.conclusion || '';

      await savePatientDocument({
        patientId: selectedPatient.id,
        documentType: form.documentType,
        title,
        description,
        formData: form,
        signatureDataUrl,
      });

      setSaveMessage('Documento salvo na aba Docs do paciente.');
    } catch (err: any) {
      setSaveMessage(err?.message || 'Erro ao salvar documento.');
    } finally {
      setSavingDocument(false);
    }
  };

  return (
    <div className="mx-auto max-w-full text-left">
      <DocumentPrintStyles />

      <div className="print:hidden">
        <h1 className="text-3xl font-semibold text-[#502815]">Documentos</h1>
        <p className="mt-2 text-sm text-[#6B5A4B]">
          Preencha os campos restantes e exporte o documento usando a opção de salvar como PDF.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <section className="print:hidden">
          <div className="space-y-4 rounded-md border border-[#D79A69] bg-white p-4">
            <label className="block text-sm font-semibold text-[#502815]">
              Tipo de documento
              <select
                value={form.documentType}
                onChange={(event) => updateField('documentType', event.target.value as DocumentType)}
                className="mt-1 w-full rounded-md border border-[#D8C0A3] bg-white px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#6A3710]"
              >
                {Object.entries(DOCUMENT_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-[#502815]">
              Paciente
              <PatientSelect
                value={form.patientId}
                onChange={handlePatientChange}
                patients={patients}
                loading={loadingPatients}
                className="mt-1 border-[#D8C0A3] focus-within:border-[#6A3710]"
              />
            </label>

            <label className="block text-sm font-semibold text-[#502815]">
              Sessão para preencher dados de comparecimento
              <select
                value={form.sessionId}
                onChange={(event) => handleSessionChange(event.target.value)}
                disabled={!selectedPatient || loadingSessions}
                className="mt-1 w-full rounded-md border border-[#D8C0A3] bg-white px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#6A3710] disabled:bg-[#F7F2EC]"
              >
                <option value="">{loadingSessions ? 'Carregando sessões...' : 'Opcional'}</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {formatDate(dateFromIso(session.startsAt))} - {timeFromIso(session.startsAt)}
                  </option>
                ))}
              </select>
            </label>

            <DocumentFormFields
              form={form}
              signatureDataUrl={signatureDataUrl}
              onSignatureChange={setSignatureDataUrl}
              onUpdateField={updateField}
            />

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full rounded-md bg-[#6A3710] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#502815]"
              >
                Exportar como PDF
              </button>

              <button
                type="button"
                onClick={handleSaveDocument}
                disabled={!selectedPatient || savingDocument}
                className="w-full rounded-md border border-[#6A3710] px-4 py-3 text-sm font-semibold text-[#6A3710] transition hover:bg-[#F7F2EC] disabled:cursor-not-allowed disabled:border-[#D8C0A3] disabled:text-[#B19A83]"
              >
                {savingDocument ? 'Salvando...' : 'Salvar no paciente'}
              </button>

              {saveMessage ? <p className="text-sm font-semibold text-[#6A3710]">{saveMessage}</p> : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleWhatsappShare}
                  disabled={!selectedPatient?.phone}
                  className="rounded-md border border-[#6A3710] px-4 py-3 text-sm font-semibold text-[#6A3710] transition hover:bg-[#F7F2EC] disabled:cursor-not-allowed disabled:border-[#D8C0A3] disabled:text-[#B19A83]"
                >
                  Enviar por WhatsApp
                </button>

                <button
                  type="button"
                  onClick={handleEmailShare}
                  disabled={!selectedPatient?.email}
                  className="rounded-md border border-[#6A3710] px-4 py-3 text-sm font-semibold text-[#6A3710] transition hover:bg-[#F7F2EC] disabled:cursor-not-allowed disabled:border-[#D8C0A3] disabled:text-[#B19A83]"
                >
                  Enviar por e-mail
                </button>
              </div>

              <p className="text-xs leading-5 text-[#6B5A4B]">
                Na janela de impressão, desmarque a opção "Cabeçalhos e rodapés" para remover a data, o nome da página
                e a URL do PDF. Depois de salvar o PDF, use uma das opções acima para abrir o contato do paciente com a
                mensagem pronta e anexar o arquivo.
              </p>
            </div>
          </div>
        </section>

        <section>
          <DocumentPreview form={form} signatureDataUrl={signatureDataUrl} />
        </section>
      </div>
    </div>
  );
}

export default Documentos;
