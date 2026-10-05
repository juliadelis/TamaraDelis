import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { PERSONAL_RECURRENCE, savePersonalAppointment, type PersonalAppointment, type PersonalRecurrence } from '../../../../shared/services/personalAppointment';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '../../../../shared/services/personalFinance';

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
  const [amount, setAmount] = useState(appointment?.expense ? String(appointment.expense.amount) : '');
  const [category, setCategory] = useState<ExpenseCategory | ''>(appointment?.expense?.category || '');
  const [saving, setSaving] = useState(false);
  const [recurrence, setRecurrence] = useState<PersonalRecurrence>('none');
  const [until, setUntil] = useState('');
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
        const saved = await savePersonalAppointment({ name: name.trim(), starts_at: new Date(start).toISOString(), duration_minutes: Number(duration), notes, amount: amount === '' ? null : Number(amount), category: amount === '' ? null : category || null, ...(!appointment ? { recurrence_type: recurrence, recurrence_until: recurrence === 'none' ? null : until } : {}) }, appointment?.id);
        onSaved(saved);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível salvar.');
      } finally { setSaving(false); }
    }}>
      <label className="block">Nome<input className={inputClass} value={name} onChange={e => setName(e.target.value)} required maxLength={200} disabled={saving} autoFocus /></label>
      <label className="block">Data e horário<input className={inputClass} type="datetime-local" value={start} onChange={e => setStart(e.target.value)} required disabled={saving} /></label>
      <label className="block">Duração (minutos)<input className={inputClass} type="number" min={1} max={1440} step={1} value={duration} onChange={e => setDuration(e.target.value)} required disabled={saving} /></label>
      <label className="block">Observação<textarea className={inputClass} rows={4} value={notes} onChange={e => setNotes(e.target.value)} maxLength={10000} disabled={saving} /></label>
      {!appointment && <fieldset className="space-y-3" disabled={saving}>
        <label className="block">Repetição<select className={inputClass} value={recurrence} onChange={e => setRecurrence(e.target.value as PersonalRecurrence)}>
          {Object.entries(PERSONAL_RECURRENCE).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
        {recurrence !== 'none' && <>
          <label className="block">Repetir até<input className={inputClass} type="date" min={start.slice(0, 10)} value={until} onChange={e => setUntil(e.target.value)} required /></label>
          <p className="text-xs">Período máximo de 1 ano. Cada ocorrência mantém o horário e, se houver valor, gera sua própria despesa. Nos meses sem o dia escolhido, usamos o último dia do mês.</p>
        </>}
      </fieldset>}
      {appointment?.recurrence_type && appointment.recurrence_type !== 'none' && <p className="text-sm">Repetição: {PERSONAL_RECURRENCE[appointment.recurrence_type]}. Esta edição altera somente este compromisso.</p>}
      <fieldset className="space-y-3 rounded-lg border border-[#D8C8BA] p-3" disabled={saving}>
        <legend className="px-1 font-semibold">Finanças pessoais (opcional)</legend>
        <p className="text-sm">Preencha o valor e a categoria para registrar também uma despesa com o nome e a data deste compromisso. Sem valor, ele aparece apenas na agenda.</p>
        <label className="block">Valor (R$)<input className={inputClass} type="number" inputMode="decimal" min="0.01" max="9999999999.99" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Opcional" /></label>
        <label className="block">Categoria<select className={inputClass} value={category} onChange={e => setCategory(e.target.value as ExpenseCategory | '')} required={amount !== ''}>
          <option value="">Selecione uma categoria</option>
          {EXPENSE_CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
        <p className="text-xs">Cada repetição com valor entra nas despesas do mês em que está marcada, inclusive as ocorrências futuras.</p>
        {appointment?.expense && <p className="text-xs">Limpar o valor remove a despesa vinculada e mantém o compromisso na agenda.</p>}
      </fieldset>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" disabled={saving} onClick={onHide}>Cancelar</button>
        <button type="submit" disabled={saving} className="rounded-md bg-[#6A3710] px-4 py-2 text-white disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar compromisso'}</button>
      </div>
    </form>
  </Dialog>;
}
