// Pembantu navigasi opsi untuk Select (murni, tanpa React)
interface NavOption {
  label: string;
  disabled?: boolean;
}

const enabled = (options: NavOption[], index: number) =>
  index >= 0 && index < options.length && !options[index].disabled;

export const firstEnabled = (options: NavOption[]) => options.findIndex((o) => !o.disabled);

export const lastEnabled = (options: NavOption[]) => {
  for (let i = options.length - 1; i >= 0; i--) if (!options[i].disabled) return i;
  return -1;
};

// Opsi aktif berikutnya ke arah `step` (1 atau -1), melewati yang disabled.
// Bila tidak ada lagi, tetap di posisi semula.
export const moveEnabled = (options: NavOption[], from: number, step: 1 | -1) => {
  for (let i = from + step; i >= 0 && i < options.length; i += step) {
    if (enabled(options, i)) return i;
  }
  return enabled(options, from) ? from : step === 1 ? firstEnabled(options) : lastEnabled(options);
};

// Type-ahead: cari opsi berawalan `text`, mulai setelah `from` lalu memutar ke awal
export const findByPrefix = (options: NavOption[], text: string, from: number) => {
  const needle = text.toLowerCase();
  for (let offset = 1; offset <= options.length; offset++) {
    const i = (from + offset + options.length) % options.length;
    if (enabled(options, i) && options[i].label.toLowerCase().startsWith(needle)) return i;
  }
  return -1;
};
