// Format tanggal Indonesia untuk tampilan (tanpa bergantung zona waktu perangkat)
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// '2026-08' -> 'Agustus 2026'
export const periodLabel = (period: string) => {
  const [year, month] = period.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
};

// '2026-08-05' -> '5 Agu 2026'
export const dateLabel = (date: string) => {
  const [year, month, day] = date.slice(0, 10).split('-');
  return `${Number(day)} ${MONTHS_SHORT[Number(month) - 1]} ${year}`;
};

// '2026-08-05' -> 'Agu 2026'
export const monthYearLabel = (date: string) => {
  const [year, month] = date.split('-');
  return `${MONTHS_SHORT[Number(month) - 1]} ${year}`;
};

// '2026-08-05' -> '5'
export const dayOfMonth = (date: string) => String(Number(date.slice(8, 10)));

// '2026-08-05T10:24' -> '5 Agu 2026, 10:24'
export const dateTimeLabel = (dateTime: string) =>
  `${dateLabel(dateTime)}, ${dateTime.slice(11, 16)}`;

const jakartaParts = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric', month: 'numeric', day: 'numeric',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

// ISO UTC dari backend -> '5 Agu 2026, 10:24' dalam zona Asia/Jakarta
export const isoDateTimeLabel = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  const part = Object.fromEntries(jakartaParts.formatToParts(date).map((p) => [p.type, p.value]));
  return `${Number(part.day)} ${MONTHS_SHORT[Number(part.month) - 1]} ${part.year}, ${part.hour}:${part.minute}`;
};

// Bulan berjalan menurut zona Asia/Jakarta (sama dengan zona backend), 'YYYY-MM'
export const currentPeriod = () => {
  const part = Object.fromEntries(jakartaParts.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return `${part.year}-${String(Number(part.month)).padStart(2, '0')}`;
};

// Bulan berjalan dan `count - 1` bulan berikutnya, tanpa bulan lampau
export const upcomingPeriods = (count: number) => {
  const [year, month] = currentPeriod().split('-').map(Number);
  return Array.from({ length: count }, (_, i) => {
    const index = month - 1 + i;
    return `${year + Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`;
  });
};

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Tanggal hari ini menurut zona Asia/Jakarta, 'YYYY-MM-DD'
export const todayJakarta = () => {
  const part = Object.fromEntries(jakartaParts.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return `${part.year}-${String(Number(part.month)).padStart(2, '0')}-${String(Number(part.day)).padStart(2, '0')}`;
};

// '2026-10-20' -> 'Selasa, 20 Okt 2026'
export const fullDateLabel = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  // Hari dihitung di UTC agar tidak bergeser oleh zona waktu perangkat
  return `${DAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]}, ${dateLabel(date)}`;
};

// Tanggal yang masih boleh dipakai dalam satu periode ('YYYY-MM'):
// bulan lampau -> kosong; bulan berjalan -> hari ini s.d. akhir bulan; bulan mendatang -> semua hari
export const remainingDatesInPeriod = (period: string, today: string) => {
  const [year, month] = period.split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const dates: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${period}-${String(day).padStart(2, '0')}`;
    if (date >= today) dates.push(date); // format 'YYYY-MM-DD' bisa dibandingkan sebagai teks
  }
  return dates;
};

// Jam sekarang menurut zona Asia/Jakarta, 'HH:mm'
export const nowTimeJakarta = () => {
  const part = Object.fromEntries(jakartaParts.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return `${part.hour}:${part.minute}`;
};

// Geser tanggal 'YYYY-MM-DD' sebanyak `days` hari (boleh negatif)
export const shiftDate = (date: string, days: number) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
};
