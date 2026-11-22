export const PUBLIC_NAVIGATION_LINKS = [
  { label: 'Início', href: '/#inicio' },
  { label: 'Sobre mim', href: '/sobre-mim' },
  { label: 'Psicoterapia', href: '/psicoterapia' },
  { label: 'Atendimentos', href: '/atendimentos' },
  { label: 'Dúvidas', href: '/duvidas' },
  // { label: 'Conteúdos', href: '#conteudos' },
  { label: 'Contato', href: '#contato' },
] as const;

export const PSICOTERAPIA_LINKS = [
  { label: 'Psicoterapia psicanalítica', href: '/psicoterapia' },
  { label: 'Psicoterapia presencial', href: '/psicoterapia/presencial' },
  { label: 'Psicoterapia online', href: '/psicoterapia/online' },
] as const;

export const ATENDIMENTOS_LINKS = [
  { label: 'Todos os atendimentos', href: '/atendimentos' },
  { label: 'Adultos', href: '/atendimentos/adultos' },
  { label: 'Adolescentes', href: '/atendimentos/adolescentes' },
  { label: 'Casais', href: '/atendimentos/casais' },
] as const;
