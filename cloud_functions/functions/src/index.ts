// import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { google } from 'googleapis';
import { initializeApp } from 'firebase-admin/app';
import * as functions from 'firebase-functions';
import { getFirestore } from "firebase-admin/firestore";

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

exports.syncCalendarEventsWithDb = functions.https.onCall(async (data, context) => {
  const CALENDAR_ID = data.email;
  const uid = data.uid;

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  if (!CALENDAR_ID || !uid) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing email / calendar ID / uid');
  }

  try {
    const calendarEvents: CalendarEvent[] = await fetchGoogleCalendarEvents(CALENDAR_ID);

    await Promise.all(calendarEvents.map(event => {
      if (event.id) {
        const additionalInfo = {
          clockInTime: null, 
          clockOutTime: null, 
          notes: ''
        };
        const eventWithAdditionalInfo = {
          ...event,
          ...additionalInfo
        };
        return firestore.collection('users').doc(uid).collection('appointments').doc(event.id).set(eventWithAdditionalInfo);
      }
      return null;
    }));

    return { result: 'Calendar events added to Firestore' };
  } catch (error) {
    console.error('Error:', error);
    throw new functions.https.HttpsError('unknown', 'Failed to fetch and store calendar events');
  }
});



