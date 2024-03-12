import { DateTime } from 'luxon';

/**
 * @function convertGoogleCalendarDateTimeToPST
 * @description converts a date time string to a PST string.
 * 
 * @param {string | null} dateTimeString the date time string given by the Google Calendar API, e.g. '2024-03-08T14:00:00-08:00'
 * @returns {string} the time (PST) extracted from the date time string
 */
export const convertGoogleCalendarDateTimeToPST = (dateTimeString: string | null): string => {
  if (!dateTimeString) return '';

  const zonedDate = DateTime.fromISO(dateTimeString, { zone: 'America/Los_Angeles' });
  const formattedTime = zonedDate.toFormat('h:mm a');
  return formattedTime;
};


/**
 * @function convertGoogleCalendarDateTimeToDate
 * @description converts a date time string to a readable date.
 * 
 * @param {string} zonedDateTimeString 
 * @returns {string} the date extracted from the date time string
 */
export const convertGoogleCalendarDateTimeToDate = (zonedDateTimeString: string | null): string => {
  if (!zonedDateTimeString) return '';

  const zonedDate = DateTime.fromISO(zonedDateTimeString, { zone: 'America/Los_Angeles' });
  const formattedDate = zonedDate.toFormat('LLL dd, yyyy');
  return formattedDate
};