import { Dropdown } from 'primereact/dropdown';

type PatientOption = {
  id: string;
  fullName: string;
};

type PatientSelectProps = {
  patients: PatientOption[];
  value: string;
  onChange: (patientId: string) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

export function PatientSelect({
  patients,
  value,
  onChange,
  placeholder = 'Selecione um paciente',
  loading = false,
  disabled = false,
  className = '',
}: PatientSelectProps) {
  return (
    <Dropdown
      value={value || null}
      options={patients}
      optionLabel="fullName"
      optionValue="id"
      onChange={(event) => onChange(event.value || '')}
      filter
      showClear
      filterBy="fullName"
      filterMatchMode="startsWith"
      filterPlaceholder="Pesquisar por nome"
      emptyFilterMessage="Nenhum paciente encontrado"
      emptyMessage="Nenhum paciente cadastrado"
      placeholder={loading ? 'Carregando pacientes...' : placeholder}
      loading={loading}
      disabled={disabled || loading}
      className={`w-full rounded-md border bg-white text-sm text-[#111111] outline-none [&_.p-dropdown-label]:px-3 [&_.p-dropdown-label]:py-2 ${className}`}
      panelClassName="text-left text-sm"
      aria-label="Selecionar paciente"
    />
  );
}
