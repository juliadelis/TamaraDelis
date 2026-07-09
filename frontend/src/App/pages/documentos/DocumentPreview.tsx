import { ADDRESS_LINES } from './documentTypes';
import type { DocumentForm } from './documentTypes';
import { formatDate, longDate } from './documentUtils';

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

export function DocumentPreview({ form, signatureDataUrl }: { form: DocumentForm; signatureDataUrl: string }) {
  return (
    <article className="document-print-area relative mx-auto flex min-h-auto max-w-198.5 flex-col overflow-hidden bg-white px-16 pb-14 pt-10 text-left text-[#111111] shadow-sm print:pt-0 print:shadow-none">
      <img
        src="/logo.svg"
        alt=""
        className="document-watermark pointer-events-none absolute left-1/2 top-1/2 z-0 w-130 -translate-x-1/2 -translate-y-1/2 opacity-[0.10] print:w-[145mm]"
      />
      <header className="document-letterhead relative z-10 flex items-start justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-[#6A3710]">Tamara Delis</h2>
          <p className="text-xs text-[#6A3710]">Psicóloga - CRP/SP 06/106405</p>
        </div>
        <img src="/logo_brown.svg" alt="Tamara Delis" className="h-12 w-auto opacity-90" />
      </header>

      <div className="document-content relative z-10 mt-12 flex-1 space-y-5 pb-14 text-[15px] leading-8">
        <DocumentBody form={form} />
        <p className="pt-2 text-right">Itapetininga/SP, {longDate(form.issueDate)}.</p>
        <div className="signature-block pt-10 text-center">
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

      <footer className="document-footer relative z-10 mt-auto shrink-0 border-t border-[#D8C0A3] pt-3 text-center text-[11px] leading-5 text-[#6A3710]">
        {ADDRESS_LINES.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </footer>
    </article>
  );
}
