import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { getPatientRecord } from '../../../shared/services/patient';
import { getSessions } from '../../../shared/services/session';
import type { PatientRecord } from '../../../shared/models/patient.model';
import type { PatientSession } from '../../../shared/models/session.model';

type DocumentType = 'atestado' | 'declaracao' | 'laudo' | 'parecer';

type DocumentForm = {
  documentType: DocumentType;
  patientId: string;
  sessionId: string;
  patientName: string;
  patientCpf: string;
  firstConsultationDate: string;
  issueDate: string;
  appointmentDate: string;
  appointmentStart: string;
  appointmentEnd: string;
  frequency: string;
  restriction: string;
  leaveDays: string;
  demandDescription: string;
  procedure: string;
  analysis: string;
  conclusion: string;
  references: string;
  subject: string;
  diagnosis: string;
  modality: string;
};

const ADDRESS_LINES = [
  'Larizzate Boulevard & Offices • Andar 4 • Sala 404',
  'R. Aristides Lobo, 224 - Centro, Itapetininga - SP, 18200-185',
];

const DOCUMENT_LABEL: Record<DocumentType, string> = {
  atestado: 'Atestado Psicológico',
  declaracao: 'Declaração de Comparecimento',
  laudo: 'Laudo Psicológico',
  parecer: 'Parecer Psicológico',
};

const initialForm: DocumentForm = {
  documentType: 'atestado',
  patientId: '',
  sessionId: '',
  patientName: '',
  patientCpf: '',
  firstConsultationDate: '',
  issueDate: new Date().toISOString().slice(0, 10),
  appointmentDate: '',
  appointmentStart: '',
  appointmentEnd: '',
  frequency: 'semanal',
  restriction: '',
  leaveDays: '',
  demandDescription: '',
  procedure: 'Psicoterapia individual',
  analysis: '',
  conclusion: '',
  references: '',
  subject: 'Solicitação de documento psicológico contendo informações pertinentes ao acompanhamento realizado.',
  diagnosis: '',
  modality: 'Online',
};

function formatDate(value = '') {
  if (!value) return '____/____/________';
  const [year, month, day] = value.slice(0, 10).split('-');
  if (year && month && day) return `${day}/${month}/${year}`;
  return value;
}

function longDate(value = '') {
  if (!value) return '____ de __________________ de ________';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '____ de __________________ de ________';

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function timeFromIso(value = '') {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function dateFromIso(value = '') {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function onlyDigits(value = '') {
  return value.replace(/\D/g, '');
}

function phoneForWhatsapp(value = '') {
  const digits = onlyDigits(value);
  if (!digits) return '';
  return digits.startsWith('55') ? digits : `55${digits}`;
}

function TextField({
  label,
  name,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  name: keyof DocumentForm;
  value: string;
  onChange: (name: keyof DocumentForm, value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-[#502815]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className="mt-1 w-full rounded-md border border-[#D8C0A3] bg-white px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#6A3710]"
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: keyof DocumentForm;
  value: string;
  onChange: (name: keyof DocumentForm, value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-[#502815] sm:col-span-2">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className="mt-1 min-h-24 w-full rounded-md border border-[#D8C0A3] bg-white px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#6A3710]"
      />
    </label>
  );
}

function SignaturePad({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  const drawFromEvent = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;

    context.lineTo(x, y);
    context.stroke();
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    context.strokeStyle = '#111111';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    context.beginPath();
    context.moveTo(x, y);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawFromEvent(event);
  };

  const handlePointerUp = () => {
    const canvas = canvasRef.current;
    if (!canvas || !drawingRef.current) return;

    drawingRef.current = false;
    onChange(canvas.toDataURL('image/png'));
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div className="sm:col-span-2">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[#502815]">Assinatura digital opcional</span>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-semibold text-[#6A3710] underline"
        >
          Limpar assinatura
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={640}
        height={180}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="h-32 w-full touch-none rounded-md border border-[#D8C0A3] bg-white"
        aria-label="Campo para desenhar assinatura digital"
      />
      <p className="mt-2 text-xs text-[#6B5A4B]">
        {value ? 'Assinatura aplicada ao documento.' : 'Desenhe aqui caso queira incluir a assinatura no PDF.'}
      </p>
    </div>
  );
}

function Identification({ form }: { form: DocumentForm }) {
  return (
    <section className="space-y-2">
      <p>
        <strong>Identificação:</strong>
      </p>
      <p>Psicóloga: Tamara V. Delis - CPF: 203.242.638-21 - CRP/SP 06/106405</p>
      <p>
        <strong>Solicitante:</strong> Sr.(a) {form.patientName || '______________________________________'},
        portador(a) do CPF nº {form.patientCpf || '________________'}.
      </p>
    </section>
  );
}

function DocumentBody({ form }: { form: DocumentForm }) {
  if (form.documentType === 'declaracao') {
    return (
      <>
        <h1>Declaração de Comparecimento</h1>
        <p>
          Declaro, para os devidos fins, que o(a) Sr.(a){' '}
          <strong>{form.patientName || '______________________________________'}</strong>, portador(a) do CPF nº{' '}
          <strong>{form.patientCpf || '________________'}</strong>, compareceu a atendimento psicológico nesta data,
          no horário das <strong>{form.appointmentStart || '______'}</strong> às{' '}
          <strong>{form.appointmentEnd || '______'}</strong>.
        </p>
        <p>A presente declaração é emitida exclusivamente para comprovação de comparecimento.</p>
      </>
    );
  }

  if (form.documentType === 'atestado') {
    return (
      <>
        <h1>Atestado Psicológico</h1>
        <Identification form={form} />
        <p>
          Atesto, para os devidos fins, que o(a) Sr.(a){' '}
          <strong>{form.patientName || '______________________________________'}</strong> encontra-se em
          acompanhamento psicológico desde <strong>{formatDate(form.firstConsultationDate)}</strong>, com
          atendimentos realizados em frequência <strong>{form.frequency || '____________'}</strong>.
        </p>
        <p>
          No momento, o(a) paciente apresenta manifestações psíquicas que vêm produzindo prejuízos significativos em
          seu funcionamento emocional e em atividades relacionadas à demanda apresentada em acompanhamento psicológico.
        </p>
        <p>
          Considerando os elementos observados no contexto do atendimento psicológico e visando à preservação de sua
          saúde mental, recomenda-se o afastamento/restrição temporária de{' '}
          <strong>{form.restriction || '______________________________________________'}</strong> pelo período de{' '}
          <strong>{form.leaveDays || '_____'}</strong> dias, a contar desta data, período durante o qual permanecerá
          em acompanhamento psicológico.
        </p>
        <p>Este documento foi elaborado a pedido do(a) interessado(a), para os fins que julgar pertinentes.</p>
      </>
    );
  }

  if (form.documentType === 'laudo') {
    return (
      <>
        <h1>Laudo Psicológico</h1>
        <Identification form={form} />
        <h2>Descrição da demanda</h2>
        <p>{form.demandDescription || 'Motivo da avaliação e solicitação do documento.'}</p>
        <h2>Procedimento</h2>
        <p>{form.procedure || 'Metodologia, técnicas e instrumentos utilizados.'}</p>
        <p>
          <strong>Sessão:</strong> Psicoterapia individual - modalidade: {form.modality || '____________'}.
        </p>
        <h2>Análise</h2>
        <p>{form.analysis || 'Interpretação dos dados coletados.'}</p>
        <h2>Conclusão</h2>
        <p>{form.conclusion || 'Síntese e diagnóstico, quando aplicável.'}</p>
        <h2>Referências</h2>
        <p>{form.references || 'Base teórica e científica utilizada.'}</p>
      </>
    );
  }

  return (
    <>
      <h1>Parecer Psicológico</h1>
      <Identification form={form} />
      <h2>Assunto</h2>
      <p>{form.subject || 'Solicitação de parecer psicológico.'}</p>
      <p>
        <strong>Sessão:</strong> Psicoterapia individual - modalidade: {form.modality || '____________'}.
      </p>
      <h2>Diagnóstico e quadro clínico</h2>
      <p>{form.diagnosis || 'Descreva o diagnóstico e o quadro clínico observado.'}</p>
      <h2>Parecer</h2>
      <p>{form.conclusion || 'Descreva a conclusão técnica do parecer.'}</p>
    </>
  );
}

function DocumentPreview({ form, signatureDataUrl }: { form: DocumentForm; signatureDataUrl: string }) {
  return (
    <article className="document-print-area relative mx-auto flex min-h-280 max-w-198.5 flex-col overflow-hidden bg-white px-16 py-14 text-left text-[#111111] shadow-sm print:shadow-none">
      <img src="/logo.svg" alt="" className="pointer-events-none absolute left-1/2 top-1/2 w-95 -translate-x-1/2 -translate-y-1/2 opacity-[0.06]" />
      <header className="relative z-10 flex items-start justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-[#6A3710]">Tamara Delis</h2>
          <p className="text-xs text-[#6A3710]">Psicóloga - CRP/SP 06/106405</p>
        </div>
        <img src="/logo.svg" alt="Tamara Delis" className="h-12 w-auto opacity-90" />
      </header>

      <div className="relative z-10 mt-16 flex-1 space-y-5 pb-14 text-[15px] leading-8">
        <DocumentBody form={form} />
        <p className="pt-5 text-right">Itapetininga/SP, {longDate(form.issueDate)}.</p>
        <div className="signature-block pt-12 text-center">
          {signatureDataUrl ? (
            <img
              src={signatureDataUrl}
              alt="Assinatura digital"
              className="mx-auto -mb-2.5 h-20 w-72 object-contain"
            />
          ) : null}
          <div className="mx-auto h-px w-72 bg-[#111111]" />
          <p className="mt-3 font-semibold">Tamara V. Delis</p>
          <p>Psicóloga - CRP/SP 06/106405</p>
        </div>
      </div>

      <footer className="relative z-10 mt-auto shrink-0 border-t border-[#D8C0A3] pt-3 text-center text-[11px] leading-5 text-[#6A3710]">
        {ADDRESS_LINES.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </footer>
    </article>
  );
}

export function Documentos() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [form, setForm] = useState<DocumentForm>(initialForm);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);

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

  return (
    <div className="mx-auto max-w-full text-left">
      <style>
        {`
          .document-print-area h1 {
            text-align: center;
            color: #502815;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 32px;
            text-transform: uppercase;
          }

          .document-print-area h2 {
            color: #502815;
            font-size: 16px;
            font-weight: 700;
            margin-top: 18px;
          }

          .document-print-area .signature-block,
          .document-print-area footer {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          @media print {
            @page {
              size: A4;
              margin: 0;
            }

            body * {
              visibility: hidden;
            }

            .document-print-area,
            .document-print-area * {
              visibility: visible;
            }

            .document-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 210mm;
              min-height: 297mm;
              max-width: none;
              padding: 18mm 18mm 14mm;
            }
          }
        `}
      </style>

      <div className="print:hidden">
        <h1 className="text-3xl font-semibold text-[#502815]">Documentos</h1>
        <p className="mt-2 text-sm text-[#6B5A4B]">
          Preencha os campos restantes e exporte o documento usando a opção de salvar como PDF.
        </p>
      </div>

      <div className="mt-6 flex flex-col  gap-6 ">
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
              <select
                value={form.patientId}
                onChange={(event) => handlePatientChange(event.target.value)}
                className="mt-1 w-full rounded-md border border-[#D8C0A3] bg-white px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#6A3710]"
              >
                <option value="">{loadingPatients ? 'Carregando pacientes...' : 'Selecione um paciente'}</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.fullName}
                  </option>
                ))}
              </select>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Nome do paciente" name="patientName" value={form.patientName} onChange={updateField} />
              <TextField label="CPF do paciente" name="patientCpf" value={form.patientCpf} onChange={updateField} />
              <TextField label="Primeira consulta" name="firstConsultationDate" value={form.firstConsultationDate} onChange={updateField} type="date" />
              <TextField label="Data de emissão" name="issueDate" value={form.issueDate} onChange={updateField} type="date" />
              <TextField label="Data de comparecimento" name="appointmentDate" value={form.appointmentDate} onChange={updateField} type="date" />
              <TextField label="Horário inicial" name="appointmentStart" value={form.appointmentStart} onChange={updateField} />
              <TextField label="Horário final" name="appointmentEnd" value={form.appointmentEnd} onChange={updateField} />
              <TextField label="Frequência" name="frequency" value={form.frequency} onChange={updateField} />
              <TextField label="Restrição/afastamento de" name="restriction" value={form.restriction} onChange={updateField} />
              <TextField label="Quantidade de dias" name="leaveDays" value={form.leaveDays} onChange={updateField} />
              <TextField label="Modalidade" name="modality" value={form.modality} onChange={updateField} />
              <TextAreaField label="Assunto" name="subject" value={form.subject} onChange={updateField} />
              <TextAreaField label="Descrição da demanda" name="demandDescription" value={form.demandDescription} onChange={updateField} />
              <TextAreaField label="Procedimento" name="procedure" value={form.procedure} onChange={updateField} />
              <TextAreaField label="Análise" name="analysis" value={form.analysis} onChange={updateField} />
              <TextAreaField label="Diagnóstico / quadro clínico" name="diagnosis" value={form.diagnosis} onChange={updateField} />
              <TextAreaField label="Conclusão / parecer" name="conclusion" value={form.conclusion} onChange={updateField} />
              <TextAreaField label="Referências" name="references" value={form.references} onChange={updateField} />
              <SignaturePad value={signatureDataUrl} onChange={setSignatureDataUrl} />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full rounded-md bg-[#6A3710] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#502815]"
              >
                Exportar como PDF
              </button>

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
                Depois de salvar o PDF, use uma das opções acima para abrir o contato do paciente com a mensagem pronta e anexar o arquivo.
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
