import { DateTime } from 'luxon';


/**
 * @description Determines if the provided date string is today.
 * 
 * @param {string | null} dateString The date string in the format 'YYYY-MM-DDTHH:mm:ssZ'
 * @returns {boolean} True if the date is today, false otherwise
 */
export function isToday(dateString: string | null): boolean {
  if (!dateString) return false;

  const inputDate = DateTime.fromISO(dateString);
  const now = DateTime.local();
  return inputDate.hasSame(now, 'day');
}