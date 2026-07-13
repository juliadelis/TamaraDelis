export const emptyValue = '-';

export function formatDate(value = '') {
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

export function formatDateTime(value = '') {
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

