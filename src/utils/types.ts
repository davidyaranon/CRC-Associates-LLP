/**
 * @file types.ts
 * @fileoverview contains type definitions used throughout the application
 */

import { Timestamp } from "@firebase/firestore";

export type Attachment = {
  name: string | null | undefined;
  fileUrl: string | null | undefined;
};

export type CalendarEvent = { // Home page
  title: string | null;
  id: string | null;
  location: string | null;
  startDateTime: string | null;
  endDateTime: string | null;
  description: string | null;
  attachments: Attachment[];
};

export type Appointment = {
  attachments: any[];
  description: string | null;
  endDateTime: string | null;
  id: string;
  location: string | null;
  startDateTime: string | null;
  title: string | null;
};

export type AppointmentInfo = {
  attachments: Attachment[];
  clockInTime: Timestamp | null;
  clockOutTime: Timestamp | null;
  description: string;
  endDateTime: string;
  id: string;
  latitude: number;
  location: string;
  longitude: number;
  notes: string;
  photoUrls: string[];
  startDateTime: string;
  title: string;
  signatureUrl: string;
};