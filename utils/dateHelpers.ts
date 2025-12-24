import { ScheduleType } from '@/types';

export function calculateNextDueDate(lastGiven: string, schedule: ScheduleType): string {
  const date = new Date(lastGiven);
  
  switch (schedule) {
    case 'Daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'Weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'Monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'Every 3 Months':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'Every 6 Months':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'Yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  return date.toISOString().split('T')[0];
}

export function isToday(dateString: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
}

export function isPastDue(dateString: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateString < today;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  });
}
