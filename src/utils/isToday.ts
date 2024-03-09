/**
 * @description Determines if the provided date string is today.
 * 
 * @param {string | null} dateString The date string in the format 'YYYY-MM-DDTHH:mm:ssZ'
 * @returns {boolean} True if the date is today, false otherwise
 */
export function isToday(dateString: string | null): boolean {
  if(!dateString) return false;
  const inputDate = new Date(dateString);
  const today = new Date();

  return inputDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
}
