export function formatDate(value = '') {
  if (!value) return '____/____/________';
  const [year, month, day] = value.slice(0, 10).split('-');
  if (year && month && day) return `${day}/${month}/${year}`;
  return value;
}

export function longDate(value = '') {
  if (!value) return '____ de __________________ de ________';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '____ de __________________ de ________';

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function timeFromIso(value = '') {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function dateFromIso(value = '') {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function onlyDigits(value = '') {
  return value.replace(/\D/g, '');
}

export function phoneForWhatsapp(value = '') {
  const digits = onlyDigits(value);
  if (!digits) return '';
  return digits.startsWith('55') ? digits : `55${digits}`;
}
