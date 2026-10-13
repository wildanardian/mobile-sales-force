import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '../../lib/cn';
import { isHttpUrl } from '../../lib/url';

interface Props {
  src: string;
  alt: string;
  className?: string;
}

// Gambar dari URL luar: hanya dimuat bila berskema http/https,
// dan diganti ikon lokal bila gagal dimuat
export default function VisitThumb({ src, alt, className }: Props) {
  // URL yang gagal dimuat disimpan agar fallback otomatis hilang saat src berganti
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = isHttpUrl(src) && failedSrc !== src;

  return showImage ? (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      className={cn('rounded-md bg-gray-100 object-cover', className)}
    />
  ) : (
    <span
      role="img"
      aria-label={`${alt} tidak dapat ditampilkan`}
      className={cn('flex items-center justify-center rounded-md bg-gray-100 text-gray-400', className)}
    >
      <ImageOff size={18} />
    </span>
  );
}
