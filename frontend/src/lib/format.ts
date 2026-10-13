import { format, parse } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatPeriod = (period: string) =>
  format(parse(period.slice(0, 7), 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: id });

export const formatDate = (iso: string) =>
  format(new Date(iso), 'd MMM yyyy, HH:mm', { locale: id });