

/**
 * @function convertGoogleCalendarDateTimeToPST
 * @description converts a date time string to a PST string.
 * 
 * @param {string | null} dateTimeString the date time string given by the Google Calendar API, e.g. '2024-03-08T14:00:00-08:00'
 * @returns {string} the time (PST) extracted from the date time string
 */
export const convertGoogleCalendarDateTimeToPST = (dateTimeString: string | null): string => {
  if (!dateTimeString) return '';

  const dateObject: Date = new Date(dateTimeString);
  const time: string = dateObject.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'America/Los_Angeles'
  });
  return time;
};


/**
 * @function convertGoogleCalendarDateTimeToDate
 * @description converts a date time string to a readable date.
 * 
 * @param {string} dateTimeString 
 * @returns {string} the date extracted from the date time string
 */
export const convertGoogleCalendarDateTimeToDate = (dateTimeString: string | null): string => {
  if (!dateTimeString) return '';

  const dateObject = new Date(dateTimeString);
  dateObject.setMinutes(dateObject.getMinutes() - dateObject.getTimezoneOffset());
  const date: string = dateObject.toISOString().split('T')[0];
  const readableDate = new Date(date);

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  };
  const formattedDate = readableDate.toLocaleDateString('en-US', options);
  return formattedDate;
};