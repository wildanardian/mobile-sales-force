import Select, { type MultiValue } from 'react-select';

export interface Option {
  value: number;
  label: string;
}

interface Props {
  options: Option[];
  value: Option[];
  onChange: (v: Option[]) => void;
  placeholder?: string;
  hasError?: boolean;
  isLoading?: boolean;
}

export default function ChipMultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Cari...',
  hasError,
  isLoading,
}: Props) {
  return (
    <Select<Option, true>
      isMulti
      options={options}
      value={value}
      isLoading={isLoading}
      onChange={(v: MultiValue<Option>) => onChange([...v])}
      placeholder={placeholder}
      closeMenuOnSelect={false}
      hideSelectedOptions
      noOptionsMessage={() => 'Tidak ada data'}
      menuPortalTarget={document.body}
      styles={{
        control: (base, state) => ({
          ...base,
          minHeight: 44,
          fontSize: 16, // cegah auto-zoom iOS
          borderRadius: 8,
          borderColor: hasError ? '#ef4444' : state.isFocused ? '#0d9488' : '#d1d5db',
          boxShadow: state.isFocused ? '0 0 0 2px #0d9488' : 'none',
        }),
        multiValue: (base) => ({ ...base, backgroundColor: '#ccfbf1', borderRadius: 999 }),
        multiValueLabel: (base) => ({ ...base, color: '#115e59', fontSize: 13, paddingLeft: 8 }),
        multiValueRemove: (base) => ({ ...base, borderRadius: 999, color: '#115e59' }),
        menuPortal: (base) => ({ ...base, zIndex: 50 }),
        option: (base) => ({ ...base, fontSize: 15 }),
      }}
    />
  );
}