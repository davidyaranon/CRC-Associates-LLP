/**
 * @file types.ts
 * @fileoverview contains type definitions used throughout the application
 */

export type Attachment = {
  name: string | null | undefined;
  fileUrl: string | null | undefined;
};

export type CalendarEvent = {
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