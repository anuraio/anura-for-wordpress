import { DateFilterPreset } from '../types/blocked-logins';

export interface DateRange {
  start_date: string;
  end_date: string;
}

export function getDateRangeFromPreset(preset: DateFilterPreset): DateRange {
  const now = new Date();
  const endDate = now.toISOString();
  const start = new Date(now);

  if (preset === 'last_24h') {
    start.setHours(start.getHours() - 24);
  } else if (preset === 'last_7d') {
    start.setDate(start.getDate() - 7);
  } else if (preset === 'last_30d') {
    start.setDate(start.getDate() - 30);
  } else {
    return { start_date: '', end_date: '' };
  }

  return { start_date: start.toISOString(), end_date: endDate };
}
