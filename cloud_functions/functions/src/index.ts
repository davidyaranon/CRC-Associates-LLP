// import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { google } from 'googleapis';
import { initializeApp } from 'firebase-admin/app';
import * as functions from 'firebase-functions';
import { Timestamp, getFirestore } from "firebase-admin/firestore";

initializeApp();
const firestore = getFirestore();

type Attachment = {
  name: string | null | undefined;
  fileUrl: string | null | undefined;
};

type CalendarEvent = {
  title: string | null;
  id: string | null;
  location: string | null;
  startDateTime: string | null;
  endDateTime: string | null;
  description: string | null;
  attachments: Attachment[];
};

const serviceAccount: Record<string, string> = {
  "type": "service_account",
  "project_id": "crc-associates-llp",
  "private_key_id": "aaa960140ac5dd47a44b89fa9c4368d9b3d17ab5",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDCuoM8vc/gmup/\nqAqrrKQ07rJg1bhz39PSRcUn0ZgJDUBMkiv4wlw/IcOVwouwJMbTuEI3QGm84dJf\nqhSJK8/GiIoFoFOiM3WZa3gZ/wr2xjZKbvQfo2wo5qeYoDemjzdLS/o10/LiPuzt\nENv3+BATIOpFqmj7uE7DyZIWkD9OLetf/HcCXpEmS8BOxoe9L3+0m4FewAbPVogl\n5nn9Y6S7gS78yn3Ch+FuPUrOLbU57g0KJTgT2+sUGvFBUj+GXdfH9Czc93AJrYOr\n7VUF9n0lKCKnEaFpJCKTABi2DYeK4ZEvjjfHfDm5llVD5RyaNPBXiLbeoJch73xE\np7Qg+5BPAgMBAAECggEAEt/h4UeuAuGhLIHM6aT7PvI1XLN6hH4ZLv7PmbN0HsnS\nW1mpD3HvX7iAbQoFYNZqZefXQI8VcKxxfWT5Rpkg3j0qe68gTCQxbY8q01eS6CaA\nPqi7MDyL5aRYca/IlR65R6rJSYxjX3tP8GPmSQZvWxtL+eKxowHTXfYyGyPHhGaS\n+MfsqW5DWVNG6TFHIxe2wvgpkcLXO4wF4AxrwufCkz6C8Xkvt6BCB+rYa3ALN3+d\n86g7YhOCJCw5jnVD0unHLZw2tZ5AeId8KwKLfcWdy2LDJPlfX2vWfg+DMV3OIOG5\nwTj1H7edqQKSDfPDUhDavlpyfInRV35RBadGJ99y0QKBgQDwCbMb0SabutBz4YEa\nhF9EY6fNg/xU34rkPxUw+tOcxIBCzXqqi/Q0m25G9SFHQi34mzZbblyUiiWkpnpV\n1XzgxF0kbJJ1PnNiv8gQx5rriGhfRUtUGSFBEBAhq17VqO3lUb1JXgiqtflIrWfP\neUw1z0ulq9B2EK1Z/aaVzKCSNwKBgQDPrXyghWUrv2NgqlvOi5iOYzl0LvLHgi6k\nBQfb+LVX1u9Deb2wY1MPl5KJrFm2WhNxU9t9RTz35m6q1uJoCcUkA35bPFrmqoFP\nlWCip3FVvVfH5/rrhpwGY+SCceCzachdA7ybJsdQY6qS8OBqTKCxbe2kXJ5uM+qz\nvDm/dQBGqQKBgQDfGSTPheVMeKWmDsHf04h4F+eurC2q9Noyqi8YBwkHe9t6O2D3\ngnzHKG+mo876XBg+KIStFjYWGRBDqDer73DRt7CaWg8FybWU4osgjWT/5Ric89q/\nn1u5DSTxJkZOb2Qs73vu5OdJQzkew4zo2ORsXu8AXGC0W2vDaG2cbUQQoQKBgQCh\nfdSVtmVPuYn7lz3AxUiiIIKC2CcuAQtnvAm6ghHx9k8j9z0MNpBWZZUrvXwdkrnf\nvEfHh9m7I9MWwfZY1JAaSyUsqSg+ioP3cL8ufGpjM9NYvgmesJQPXApLbWY/3ZhS\nzB8TvvnqhzYTAYBg6Klkj4jl8Ke6JmDx1wJI4SCP0QKBgD8rBa9Wm4WCta4GrvnW\n/GEiFBbuV1ZfKOZdu0fNyWs6LbAtoY6k6AvrksRMkXJOE9yuHtXkWSzFS0NFWvLE\n7zlNoNzMRRkoXA7nZ887nw8WTsLChdWtSa0dzGp36VIVNdsGORkyt2tttW7NbtvH\n2Itjwn2wwX0SpwxLu7DXiVMG\n-----END PRIVATE KEY-----\n",
  "client_email": "calendar-key@crc-associates-llp.iam.gserviceaccount.com",
};


/**
 * @function fetchGoogleCalendarEvents
 * @description gets a list of events from the user's Google Calendar, starting from today.
 * 
 * @param {string} CALENDAR_ID the user's calendar ID, usually the same as the user's email.
 * @return {CalendarEvent[]} the list of events.
 */
const fetchGoogleCalendarEvents = async (CALENDAR_ID: string): Promise<CalendarEvent[]> => {

  const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
  const jwtClient = new google.auth.JWT(
    serviceAccount.client_email,
    '',
    serviceAccount.private_key,
    SCOPES
  );
  const calendar = google.calendar({
    version: 'v3',
    auth: jwtClient
  });
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  try {
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: startOfDay.toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;
    if (!events || events.length === 0) {
      logger.info('No upcoming events found.');
      return [];
    }

    let calendarEvents: CalendarEvent[] = [];
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const attachments = event.attachments;
      let listOfAttachments: Attachment[] = [];
      if (attachments) {
        for (let j = 0; j < attachments.length; j++) {
          const attachment = attachments[j];
          listOfAttachments.push({ name: attachment.title, fileUrl: attachment.fileUrl });
        }
      }
      const calendarEvent: CalendarEvent = {
        title: event.summary ?? null,
        startDateTime: event.start?.dateTime ?? null,
        endDateTime: event.end?.dateTime ?? null,
        location: event.location ?? null,
        description: event.description ?? null,
        attachments: listOfAttachments,
        id: event.id ?? null,
      };
      calendarEvents.push(calendarEvent);
    }

    return calendarEvents;

  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
};


/**
 * @function fetchPastGoogleCalendarEvents
 * @description gets a list of past events from the user's Google Calendar, starting from yesterday and going backwards in time.
 * 
 * @param {string} CALENDAR_ID 
 * @param {string | null} pageToken 
 * @return {Promise<{ events: CalendarEvent[], nextPageToken: string | null }>}
 */
const fetchPastGoogleCalendarEvents = async (CALENDAR_ID: string, pageToken: string | null = null): Promise<{ events: CalendarEvent[], nextPageToken: string | null }> => {
  const MAX_RESULTS = 10;
  const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
  const jwtClient = new google.auth.JWT(
    serviceAccount.client_email,
    '',
    serviceAccount.private_key,
    SCOPES
  );
  const calendar = google.calendar({
    version: 'v3',
    auth: jwtClient
  });

  const timeMinDate = new Date();
  timeMinDate.setFullYear(timeMinDate.getFullYear() - 5); // Set to 5 years ago
  timeMinDate.setHours(0, 0, 0, 0);
  const timeMaxDate = new Date();
  timeMaxDate.setDate(timeMaxDate.getDate() - 1);
  timeMaxDate.setHours(23, 59, 59, 999); // Set to end of yesterday

  try {
    let response;
    if (pageToken) {
      response = await calendar.events.list({
        calendarId: CALENDAR_ID,
        timeMin: timeMinDate.toISOString(),
        timeMax: timeMaxDate.toISOString(),
        maxResults: MAX_RESULTS,
        singleEvents: true,
        orderBy: 'startTime',
        pageToken: pageToken,
      });
    } else {
      response = await calendar.events.list({
        calendarId: CALENDAR_ID,
        timeMin: timeMinDate.toISOString(),
        timeMax: timeMaxDate.toISOString(),
        maxResults: MAX_RESULTS,
        singleEvents: true,
        orderBy: 'startTime',
      });
    }

    const events = response.data.items;
    const nextPageToken = response.data.nextPageToken ?? null;

    if (!events || events.length === 0) {
      logger.info('No upcoming events found.');
      return { events: [], nextPageToken: null };
    }

    let calendarEvents = events.reverse().map(event => {
      const attachments = event.attachments;
      let listOfAttachments = attachments?.map(attachment => ({ name: attachment.title, fileUrl: attachment.fileUrl })) ?? [];

      return {
        title: event.summary ?? null,
        startDateTime: event.start?.dateTime ?? null,
        endDateTime: event.end?.dateTime ?? null,
        location: event.location ?? null,
        description: event.description ?? null,
        attachments: listOfAttachments,
        id: event.id ?? null,
      };
    });

    return { events: calendarEvents, nextPageToken: nextPageToken };

  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return { events: [], nextPageToken: null };
  }
};


/**
 * @function fetchGoogleCalendarEventGivenEventId
 * @description gets the information about a specific calendar event given its ID.
 * 
 * @param {string} CALENDAR_ID the user's calendar ID, usually the same as the user's email.
 * @param {string} eventId the calendar event ID.
 * @returns {Promise<CalendarEvent | null>} the event info or null if no such event was found.
 */
const fetchGoogleCalendarEventGivenEventId = async (CALENDAR_ID: string, eventId: string): Promise<CalendarEvent | null> => {

  const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
  const jwtClient = new google.auth.JWT(
    serviceAccount.client_email,
    '',
    serviceAccount.private_key,
    SCOPES
  );
  const calendar = google.calendar({
    version: 'v3',
    auth: jwtClient
  });
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  try {
    const response = await calendar.events.get({
      calendarId: CALENDAR_ID,
      eventId: eventId
    });

    const event = response.data;
    if (!event) {
      logger.info('No upcoming events found.');
      return null;
    }

    let listOfAttachments: Attachment[] = [];
    if (event.attachments) {
      for (let j = 0; j < event.attachments.length; j++) {
        const attachment = event.attachments[j];
        listOfAttachments.push({ name: attachment.title, fileUrl: attachment.fileUrl });
      }
    }

    const calendarEvent: CalendarEvent = {
      title: event.summary ?? null,
      startDateTime: event.start?.dateTime ?? null,
      endDateTime: event.end?.dateTime ?? null,
      location: event.location ?? null,
      description: event.description ?? null,
      attachments: listOfAttachments,
      id: event.id ?? null,
    };

    return calendarEvent;

  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return null;
  }
};


/**
 * @function getLatLong
 * @description gets the latitude and longitude of an address using the geocode maps API
 * 
 * @param {string} address 
 * @returns {Promise<{ latitude: number | null; longitude: number | null; }>}
 */
async function getLatLong(address: string): Promise<{ latitude: number | null; longitude: number | null; }> {
  if (address.length <= 0) return { latitude: null, longitude: null };

  const url = `https://geocode.maps.co/search?q=${encodeURIComponent(address)}`;
  const response = await fetch(url);

  if (!response.ok) return { latitude: null, longitude: null };

  const data = await response.json();
  if (data.length === 0) return { latitude: null, longitude: null };

  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
  };
};







/** SERVER FUNCTIONS **/
/***********************/
exports.fetchCalendarEvents = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  if (!data || !("email" in data) || !data.email) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing email / calendar ID; The function must be called with a valid email.');
  }
  return fetchGoogleCalendarEvents(data.email);
});

exports.fetchPastCalendarEvents = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  if (!data || !("email" in data) || !data.email) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing email / calendar ID; The function must be called with a valid email.');
  }
  const nextPageToken = "nextPageToken" in data && data.nextPageToken ? data.nextPageToken : null;
  return fetchPastGoogleCalendarEvents(data.email, nextPageToken);
});

exports.syncCalendarEventWithDb = functions.https.onCall(async (data, context) => {
  const CALENDAR_ID = data.email;
  const uid = data.uid;
  const id = data.appointmentId;

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  if (!CALENDAR_ID || !uid || !id) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing email (calendar ID) / uid / event ID');
  }

  try {
    const event: CalendarEvent | null = await fetchGoogleCalendarEventGivenEventId(CALENDAR_ID, id);
    if (event && event.id) {
      const latLong = await getLatLong(event.location ?? '');
      const additionalInfo = {
        clockInTime: null as (Timestamp | null),
        clockOutTime: null as (Timestamp | null),
        notes: `<p><strong>${event.title}</strong></p>`,
        photoUrls: [] as string[],
        latitude: latLong.latitude as number,
        longitude: latLong.longitude as number,
        signatureUrl: '',
      };
      const eventWithAdditionalInfo = {
        ...event,
        ...additionalInfo
      };
      const batch = firestore.batch();
      const appointmentRef = firestore.collection('users').doc(uid).collection('appointments').doc(id);
      batch.set(appointmentRef, eventWithAdditionalInfo);
      await batch.commit();
      return { result: 'Calendar event added to Firestore' };
    } else {
      throw new Error('No event found with id ' + id);
    }
  } catch (error) {
    console.error('Error:', error);
    throw new functions.https.HttpsError('unknown', 'Failed to fetch and store calendar events');
  }
});

exports.fetchAppointmentInfo = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  if (!data || !data.appointmentId || !data.uid) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing appointment ID or user ID.');
  }

  try {
    const uid = data.uid;
    const appointmentId = data.appointmentId;
    const docRef = firestore.collection(`users/${uid}/appointments`).doc(appointmentId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      console.info(docSnap.data());
      return docSnap.data();
    } else {
      throw new functions.https.HttpsError('not-found', 'Document not found');
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    throw new functions.https.HttpsError('unknown', 'An unexpected error occurred, if this is the first time calling this function on an appointment, the databsae will sync with Google Calendar and will re-try the operation');
  }
});



