import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { savePersonalAppointment, type PersonalAppointment } from '../../../../shared/services/personalAppointment';

export function PersonalAppointmentFormDialog({ defaultStart, appointment, onHide, onSaved }: {
  defaultStart: Date;
  appointment?: PersonalAppointment | null;
  onHide: () => void;
  onSaved: (appointment: PersonalAppointment) => void;
}) {
  const [name, setName] = useState(appointment?.name || '');
  const [start, setStart] = useState(() => {
    const date = appointment ? new Date(appointment.starts_at) : defaultStart;
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  });
  const [duration, setDuration] = useState(String(appointment?.duration_minutes ?? 60));
  const [notes, setNotes] = useState(appointment?.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inputClass = 'mt-1 w-full rounded-md border border-[#BCA897] bg-white p-2';

  return <Dialog header={appointment ? 'Editar compromisso pessoal' : 'Agenda pessoal'} visible onHide={onHide} closable={!saving}
    closeOnEscape={!saving} style={{ width: '32rem', maxWidth: '95vw' }} modal>
    <form className="space-y-4 text-left text-[#502815]" onSubmit={async (event) => {
      event.preventDefault();
      if (saving) return;
      setError('');
      if (!name.trim() || !Number.isFinite(new Date(start).getTime())) {
        setError('Informe nome, data e horário válidos.');
        return;
      }
      setSaving(true);
      try {
        const saved = await savePersonalAppointment({ name: name.trim(), starts_at: new Date(start).toISOString(), duration_minutes: Number(duration), notes }, appointment?.id);
        onSaved(saved);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível salvar.');
      } finally { setSaving(false); }
    }}>
      <label className="block">Nome<input className={inputClass} value={name} onChange={e => setName(e.target.value)} required maxLength={200} disabled={saving} autoFocus /></label>
      <label className="block">Data e horário<input className={inputClass} type="datetime-local" value={start} onChange={e => setStart(e.target.value)} required disabled={saving} /></label>
      <label className="block">Duração (minutos)<input className={inputClass} type="number" min={1} max={1440} step={1} value={duration} onChange={e => setDuration(e.target.value)} required disabled={saving} /></label>
      <label className="block">Observação<textarea className={inputClass} rows={4} value={notes} onChange={e => setNotes(e.target.value)} maxLength={10000} disabled={saving} /></label>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" disabled={saving} onClick={onHide}>Cancelar</button>
        <button type="submit" disabled={saving} className="rounded-md bg-[#6A3710] px-4 py-2 text-white disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar compromisso'}</button>
      </div>
    </form>
  </Dialog>;
}
