// Utilitários para manipulação de datas

/**
 * Retorna o primeiro dia da semana (domingo) para uma data dada
 */
export const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

/**
 * Retorna um array com os 7 dias da semana a partir de uma data
 */
export const getWeekDays = (date: Date): Date[] => {
  const weekStart = getWeekStart(date);
  const days: Date[] = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  
  return days;
};

/**
 * Formata a data no padrão dd/mm/yyyy
 */
export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formata o dia da semana abreviado
 */
export const formatDayOfWeek = (date: Date): string => {
  const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  return days[date.getDay()];
};

/**
 * Verifica se duas datas são o mesmo dia
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

/**
 * Retorna se a data é hoje
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};
