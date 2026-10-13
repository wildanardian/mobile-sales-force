import { cn } from '../lib/cn';

interface Props {
  variant?: 'color' | 'light'; // light = untuk latar teal (header)
  className?: string;
}

const palette = {
  color: { dark: '#0F766E', mid: '#5DBFB1', soft: '#8AD4C8', center: '#FFFFFF' },
  light: { dark: '#FFFFFF', mid: '#B9E6DE', soft: '#D5F1EC', center: '#0F766E' },
};

export default function MsfLogo({ variant = 'color', className }: Props) {
  const c = palette[variant];

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={cn('shrink-0', className)}>
      <path d="M35 12a12 12 0 0 1 12-12h6a12 12 0 0 1 12 12v23H35z" fill={c.dark} />
      <path d="M0 47a12 12 0 0 1 12-12h23v30H12A12 12 0 0 1 0 53z" fill={c.dark} />
      <path d="M65 35h23a12 12 0 0 1 12 12v6a12 12 0 0 1-12 12H65z" fill={c.mid} />
      <path d="M35 65h30v23a12 12 0 0 1-12 12h-6a12 12 0 0 1-12-12z" fill={c.soft} />
      <rect x="35" y="35" width="30" height="30" fill={c.center} />
      <path d="M65 35c0 20-10 30-30 30h30z" fill={c.mid} />
    </svg>
  );
}
