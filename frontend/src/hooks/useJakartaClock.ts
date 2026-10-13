import { useEffect, useState } from 'react';
import { nowTimeJakarta, todayJakarta } from '../lib/dateId';

const read = () => ({ today: todayJakarta(), time: nowTimeJakarta() });

// Tanggal dan jam sekarang (zona Asia/Jakarta) yang ikut maju selama halaman terbuka,
// agar batas "tidak melewati jam sekarang" tidak basi pada form yang lama dibiarkan.
export function useJakartaClock() {
  const [clock, setClock] = useState(read);

  useEffect(() => {
    const id = setInterval(() => {
      setClock((prev) => {
        const next = read();
        return next.today === prev.today && next.time === prev.time ? prev : next;
      });
    }, 15_000);
    return () => clearInterval(id);
  }, []);

  return clock;
}
