import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { EXPENSE_CATEGORIES, deletePersonalExpense, getPersonalFinance, savePersonalExpense, type ExpenseCategory, type PersonalExpense, type PersonalFinanceSummary } from '../../../shared/services/personalFinance';

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const colors = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#db2777', '#0891b2', '#dc2626', '#65a30d', '#4f46e5', '#0d9488', '#c2410c', '#a21caf', '#475569', '#854d0e'];
const inputClass = 'mt-1 block w-full rounded-lg border border-[#D8C8BA] bg-white px-3 py-2 text-[#30251D]';
const buttonClass = 'rounded-lg bg-[#6A3710] px-4 py-2 font-semibold text-white disabled:opacity-50';
function today() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function ExpenseForm({ expense, defaultDate, onHide, onSaved }: {
  expense: PersonalExpense | null; defaultDate: string; onHide: () => void; onSaved: (saved: PersonalExpense) => void;
}) {
  const [name, setName] = useState(expense?.name || '');
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category || 'mercado');
  const [date, setDate] = useState(expense?.spent_on || defaultDate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  return <Dialog header={expense ? 'Editar despesa' : 'Adicionar despesa'} visible modal onHide={onHide} closable={!saving} closeOnEscape={!saving} style={{ width: '30rem', maxWidth: '95vw' }}>
    <form className="space-y-4 text-left" onSubmit={async event => {
      event.preventDefault();
      if (saving) return;
      setSaving(true); setError('');
      try {
        const saved = await savePersonalExpense({ name, amount: Number(amount.replace(',', '.')), category, spent_on: date }, expense?.id);
        onSaved(saved);
      } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível salvar.'); }
      finally { setSaving(false); }
    }}>
      <label className="block">Nome<input autoFocus className={inputClass} value={name} onChange={e => setName(e.target.value)} required maxLength={200} disabled={saving} /></label>
      <label className="block">Valor (R$)<input className={inputClass} type="number" inputMode="decimal" min="0.01" max="9999999999.99" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required disabled={saving} /></label>
      <label className="block">Categoria<select className={inputClass} value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} disabled={saving}>
        {EXPENSE_CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      <label className="block">Data da despesa<input className={inputClass} type="date" min="2020-01-01" max={today()} value={date} onChange={e => setDate(e.target.value)} required disabled={saving} /></label>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <div className="flex justify-end gap-3"><button type="button" onClick={onHide} disabled={saving}>Cancelar</button><button className={buttonClass} disabled={saving}>{saving ? 'Salvando...' : 'Salvar despesa'}</button></div>
    </form>
  </Dialog>;
}

export function PersonalFinance() {
  const currentDate = today();
  const [year, setYear] = useState(Number(currentDate.slice(0, 4)));
  const [month, setMonth] = useState(Number(currentDate.slice(5, 7)));
  const [summary, setSummary] = useState<PersonalFinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [form, setForm] = useState<{ expense: PersonalExpense | null } | null>(null);
  const [deleting, setDeleting] = useState<PersonalExpense | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError(''); setSummary(null);
      try {
        const data = await getPersonalFinance(year, month);
        if (active) setSummary(data);
      } catch (err) { if (active) setError(err instanceof Error ? err.message : 'Não foi possível carregar.'); }
      finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [year, month, revision]);

  const categories = EXPENSE_CATEGORIES.map(([id, label], index) => {
    const cents = (summary?.expenses || []).filter(expense => expense.category === id).reduce((sum, expense) => sum + Math.round(Number(expense.amount) * 100), 0);
    return { id, label, amount: cents / 100, color: colors[index], percent: summary?.spent ? cents / (summary.spent * 100) * 100 : 0 };
  }).filter(category => category.amount > 0);
  const gradient = categories.map((category, index) => {
    const start = categories.slice(0, index).reduce((sum, item) => sum + item.percent, 0);
    return `${category.color} ${start}% ${start + category.percent}%`;
  }).join(', ');
  const selectedMonth = `${year}-${String(month).padStart(2, '0')}`;
  const defaultDate = selectedMonth === currentDate.slice(0, 7) ? currentDate : selectedMonth < currentDate.slice(0, 7) ? `${selectedMonth}-01` : currentDate;

  return <main className="mx-auto max-w-6xl py-2 text-left text-[#30251D]">
    <Link to="/perfil" className="text-sm font-semibold text-[#6A3710] underline">← Voltar ao perfil</Link>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-3xl font-semibold text-[#502815]">Finanças pessoais</h1>
      <button type="button" className={buttonClass} onClick={() => setForm({ expense: null })}>Adicionar despesa</button>
    </div>
    <p className="mt-3 text-sm text-[#6B5A4B]">Acompanhe os recebimentos das sessões e todas as despesas do mês selecionado, incluindo as repetições futuras dos compromissos pessoais.</p>
    <div className="my-6 flex flex-wrap gap-4">
      <label>Mês<select className={inputClass} value={month} onChange={e => setMonth(Number(e.target.value))}>
        {Array.from({ length: 12 }, (_, index) => <option key={index} value={index + 1}>{new Date(2026, index, 1).toLocaleDateString('pt-BR', { month: 'long' })}</option>)}
      </select></label>
      <label>Ano<select className={inputClass} value={year} onChange={e => setYear(Number(e.target.value))}>
        {Array.from({ length: Math.max(year, Number(currentDate.slice(0, 4)) + 1) - 2019 }, (_, index) => 2020 + index).map(value => <option key={value}>{value}</option>)}
      </select></label>
    </div>
    {loading && <p role="status">Carregando finanças pessoais...</p>}
    {error && <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-700"><p>{error}</p><button type="button" className="mt-2 underline" onClick={() => setRevision(value => value + 1)}>Tentar novamente</button></div>}
    {summary && <>
      <dl className="grid gap-4 sm:grid-cols-3">
        {[{ label: 'Recebido pelas sessões', value: summary.received, color: 'text-green-700' }, { label: 'Total de despesas', value: summary.spent, color: 'text-red-700' }, { label: 'Saldo do período', value: summary.balance, color: summary.balance < 0 ? 'text-red-700' : 'text-blue-700' }].map(item => <div key={item.label} className="rounded-xl border border-[#E8DED5] bg-white p-5"><dt className="text-sm">{item.label}</dt><dd className={`mt-2 text-2xl font-semibold ${item.color}`}>{money(item.value)}</dd></div>)}
      </dl>
      <p className="mt-3 text-xs text-[#6B5A4B]">Entradas pela data do pagamento. Quando essa data não estiver registrada, usamos a data da sessão. Apenas pagamentos marcados como pagos; sessões canceladas ou remarcadas não entram no cálculo. Saldo = recebimentos − despesas.</p>
      <section className="mt-6 rounded-xl border border-[#E8DED5] bg-white p-5">
        <h2 className="text-xl font-semibold text-[#502815]">Despesas por categoria</h2>
        {categories.length ? <div className="mt-5 grid items-center gap-6 md:grid-cols-[240px_1fr]">
          <div role="img" aria-label={`Distribuição das despesas: ${categories.map(category => `${category.label} ${category.percent.toFixed(1)}%`).join(', ')}`} className="mx-auto h-56 w-56 rounded-full" style={{ background: `conic-gradient(${gradient})` }} />
          <ul className="grid gap-3 sm:grid-cols-2">{categories.map(category => <li key={category.id} className="flex items-start gap-2 text-sm">
            <span aria-hidden="true" className="mt-1 h-3 w-3 shrink-0 rounded-sm" style={{ background: category.color }} />
            <span>{category.label}<span className="block font-semibold">{money(category.amount)} · {category.percent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</span></span>
          </li>)}</ul>
        </div> : <p className="mt-4 text-sm text-[#6B5A4B]">Sem despesas neste período para exibir no gráfico.</p>}
      </section>
      <section className="mt-6 rounded-xl border border-[#E8DED5] bg-white p-5">
        <h2 className="text-xl font-semibold text-[#502815]">Despesas do período</h2>
        {!summary.expenses.length ? <p className="mt-4 text-sm">Nenhuma despesa registrada neste período.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm">
          <thead><tr className="border-b border-[#E8DED5]">{['Nome', 'Categoria', 'Data', 'Valor', 'Ações'].map(label => <th key={label} scope="col" className="px-3 py-3">{label}</th>)}</tr></thead>
          <tbody>{summary.expenses.map(expense => <tr key={expense.id} className="border-b border-[#F0E8E0]">
            <td className="max-w-64 break-words px-3 py-3">{expense.name}</td>
            <td className="px-3 py-3">{EXPENSE_CATEGORIES.find(([id]) => id === expense.category)?.[1]}</td>
            <td className="whitespace-nowrap px-3 py-3">{expense.spent_on.split('-').reverse().join('/')}</td>
            <td className="whitespace-nowrap px-3 py-3">{money(Number(expense.amount))}</td>
            <td className="px-3 py-3"><div className="flex gap-3"><button type="button" className="font-semibold text-blue-700 underline" aria-label={`Editar ${expense.name}`} onClick={() => setForm({ expense })}>Editar</button><button type="button" className="font-semibold text-red-700 underline" aria-label={`Excluir ${expense.name}`} onClick={() => { setDeleteError(''); setDeleting(expense); }}>Excluir</button></div></td>
          </tr>)}</tbody>
        </table></div>}
      </section>
    </>}
    {form && <ExpenseForm expense={form.expense} defaultDate={defaultDate} onHide={() => setForm(null)} onSaved={saved => {
      setForm(null);
      setYear(Number(saved.spent_on.slice(0, 4)));
      setMonth(Number(saved.spent_on.slice(5, 7)));
      setRevision(value => value + 1);
    }} />}
    <Dialog header="Excluir despesa" visible={Boolean(deleting)} onHide={() => { if (!busy) setDeleting(null); }} closable={!busy} closeOnEscape={!busy} modal style={{ width: '28rem', maxWidth: '95vw' }}>
      <p className="break-words">Excluir a despesa “{deleting?.name}” de {money(Number(deleting?.amount || 0))}?</p>
      {deleteError && <p role="alert" className="mt-3 text-red-700">{deleteError}</p>}
      <div className="mt-5 flex justify-end gap-3"><button type="button" disabled={busy} onClick={() => setDeleting(null)}>Cancelar</button><button type="button" disabled={busy} className="rounded-lg bg-red-700 px-4 py-2 text-white disabled:opacity-50" onClick={async () => {
        if (!deleting || busy) return;
        setBusy(true); setDeleteError('');
        try { await deletePersonalExpense(deleting.id); setDeleting(null); setRevision(value => value + 1); }
        catch (err) { setDeleteError(err instanceof Error ? err.message : 'Não foi possível excluir.'); }
        finally { setBusy(false); }
      }}>{busy ? 'Excluindo...' : 'Excluir despesa'}</button></div>
    </Dialog>
  </main>;
}
