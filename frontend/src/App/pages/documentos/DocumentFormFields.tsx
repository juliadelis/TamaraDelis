import { useRef } from 'react';
import type { PointerEvent } from 'react';
import type { DocumentForm } from './documentTypes';

type UpdateField = (name: keyof DocumentForm, value: string) => void;

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
  onChange: UpdateField;
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
  onChange: UpdateField;
}) {
  return (
    <label className="block text-sm font-semibold text-[#502815] sm:col-span-2">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className="mt-1 min-h-36 w-full resize-y rounded-md border border-[#D8C0A3] bg-white px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#6A3710]"
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

  const pointerPosition = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    return {
      canvas,
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const position = pointerPosition(event);
    const context = position?.canvas.getContext('2d');
    if (!position || !context) return;

    drawingRef.current = true;
    position.canvas.setPointerCapture(event.pointerId);
    context.strokeStyle = '#111111';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(position.x, position.y);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;

    const position = pointerPosition(event);
    const context = position?.canvas.getContext('2d');
    if (!position || !context) return;

    context.lineTo(position.x, position.y);
    context.stroke();
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
        <button type="button" onClick={handleClear} className="text-xs font-semibold text-[#6A3710] underline">
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

export function DocumentFormFields({
  form,
  signatureDataUrl,
  onSignatureChange,
  onUpdateField,
}: {
  form: DocumentForm;
  signatureDataUrl: string;
  onSignatureChange: (value: string) => void;
  onUpdateField: UpdateField;
}) {
  const isDeclaracao = form.documentType === 'declaracao';
  const isAtestado = form.documentType === 'atestado';
  const isLaudo = form.documentType === 'laudo';
  const isParecer = form.documentType === 'parecer';

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField label="Nome do paciente" name="patientName" value={form.patientName} onChange={onUpdateField} />
      <TextField label="CPF do paciente" name="patientCpf" value={form.patientCpf} onChange={onUpdateField} />
      <TextField label="Data de emissão" name="issueDate" value={form.issueDate} onChange={onUpdateField} type="date" />

      {(isAtestado || isLaudo) && (
        <TextField
          label="Primeira consulta"
          name="firstConsultationDate"
          value={form.firstConsultationDate}
          onChange={onUpdateField}
          type="date"
        />
      )}

      {isDeclaracao && (
        <>
          <TextField
            label="Data de comparecimento"
            name="appointmentDate"
            value={form.appointmentDate}
            onChange={onUpdateField}
            type="date"
          />
          <TextField label="Horário inicial" name="appointmentStart" value={form.appointmentStart} onChange={onUpdateField} />
          <TextField label="Horário final" name="appointmentEnd" value={form.appointmentEnd} onChange={onUpdateField} />
        </>
      )}

      {isAtestado && (
        <>
          <TextField label="Frequência" name="frequency" value={form.frequency} onChange={onUpdateField} />
          <TextField label="Restrição/afastamento de" name="restriction" value={form.restriction} onChange={onUpdateField} />
          <TextField label="Quantidade de dias" name="leaveDays" value={form.leaveDays} onChange={onUpdateField} />
        </>
      )}

      {isLaudo && (
        <>
          <TextField label="Modalidade" name="modality" value={form.modality} onChange={onUpdateField} />
          <TextAreaField label="Descrição da demanda" name="demandDescription" value={form.demandDescription} onChange={onUpdateField} />
          <TextAreaField label="Procedimento" name="procedure" value={form.procedure} onChange={onUpdateField} />
          <TextAreaField label="Análise" name="analysis" value={form.analysis} onChange={onUpdateField} />
          <TextAreaField label="Conclusão / parecer" name="conclusion" value={form.conclusion} onChange={onUpdateField} />
          <TextAreaField label="Referências" name="references" value={form.references} onChange={onUpdateField} />
        </>
      )}

      {isParecer && (
        <>
          <TextField label="Modalidade" name="modality" value={form.modality} onChange={onUpdateField} />
          <TextAreaField label="Assunto" name="subject" value={form.subject} onChange={onUpdateField} />
          <TextAreaField label="Diagnóstico / quadro clínico" name="diagnosis" value={form.diagnosis} onChange={onUpdateField} />
          <TextAreaField label="Conclusão / parecer" name="conclusion" value={form.conclusion} onChange={onUpdateField} />
        </>
      )}

      <SignaturePad value={signatureDataUrl} onChange={onSignatureChange} />
    </div>
  );
}
