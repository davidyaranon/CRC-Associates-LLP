/**
 * @file server.ts
 * @fileoverview contains backend functions / config used to connect to firebase backend.
 */

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth, indexedDBLocalPersistence, initializeAuth, signInWithCredential,
  signOut, GoogleAuthProvider, User, UserCredential,
} from "firebase/auth";
import {
  doc, getDoc, getFirestore, setDoc, updateDoc, DocumentReference, FirestoreError
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDAM5W2QFtFUczQ0tDJi4m3HEOH0Bdg59s",
  authDomain: "crc-associates-llp.firebaseapp.com",
  projectId: "crc-associates-llp",
  storageBucket: "crc-associates-llp.appspot.com",
  messagingSenderId: "42203963600",
  appId: "1:42203963600:web:88bfc78053ac56a8f43ed5",
  measurementId: "G-MFZTN7TGVE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const FirebaseAuth = Capacitor.isNativePlatform() ?
  initializeAuth(app, {
    persistence: indexedDBLocalPersistence,
  }) :
  getAuth();
export default FirebaseAuth;

import { GoogleAuth, User as CapacitorGoogleUser } from "@codetrix-studio/capacitor-google-auth";
import { Capacitor } from "@capacitor/core";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Preferences } from "@capacitor/preferences";
import { CalendarEvent } from "./types";

const functions = getFunctions();
const fetchCalendarEvents = httpsCallable(functions, 'fetchCalendarEvents');
const syncCalendarEventsWithDb = httpsCallable(functions, 'syncCalendarEventsWithDb');




/**
 * @function googleAuthLogin
 * @description enables Google login and authenticates the user with Firebase.
 * 
 * @returns {Promise<User | undefined>} the Firebase auth user object or undefined if failed.
 */
export const googleAuthLogin = async (): Promise<User | undefined> => {
  try {
    const googleUser: CapacitorGoogleUser = await GoogleAuth.signIn();
    const idToken: string = googleUser.authentication.idToken;

    const googleAuthProvider = new GoogleAuthProvider();
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential: UserCredential = await signInWithCredential(FirebaseAuth, credential);
    const user: User = userCredential.user;

    return user;

  } catch (error) {
    console.error('Google Auth Login Error:', error);
    return undefined;
  }
};


/**
 * @function handleUserLogin
 * @description called after the user has successfully logged in.
 * A document will be created at /users/{uid} if it is the user's first name, 
 * else the document will be updated with the user's last login time.
 */
export const handleUserLogin = async (user: User) => {
  const userDocRef: DocumentReference = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userDocRef);
  if (!docSnap.exists()) { // create the new document
    await setDoc(userDocRef, {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      role: "Care Manager",
      lastLogin: new Date()
    });
  } else { // update the document
    await updateDoc(userDocRef, {
      lastLogin: new Date(),
    });
  }

};


/**
 * @function googleAuthLogout
 * @description logs the user out of the Google and Firebase Auth sessions.
 * 
 * @returns {Promise<boolean>} true if the user was logged out, false otherwise.
 */
export const googleAuthLogout = async (): Promise<boolean> => {
  try {
    await GoogleAuth.signOut();
    await signOut(FirebaseAuth);
    sessionStorage.clear();
    localStorage.clear();
    await Preferences.clear();
    window.location.reload();
    return true;
  } catch (error) {
    console.error('Google Auth Logout Error:', error);
    return false;
  }
};


/**
 * @function getGoogleCalendarEvents 
 * @description fetches the events from the user's Google Calendar, starting from today's date.
 * 
 * @param {string} email 
 * @return {Promise<CalendarEvent[]>} the list of events on the person's Google Calendar.
 */
export const getGoogleCalendarEvents = async (email: string): Promise<CalendarEvent[]> => {
  try {
    const result = await fetchCalendarEvents({ email });
    const events: CalendarEvent[] = result.data as CalendarEvent[];
    console.log(events);
    return events;
  } catch (error) {
    console.error('Error fetching calendar events!', error);
    return [];
  }
};


/**
 * @function getAppointmentInfo
 * @description gets the information about the certain appointment at /users/{uid}/appointments/{appointmentId},
 * or if it doesn't exist, return null.
 * 
 * @param {string} uid the user's UID
 * @param {string} appointmentId the id of the calendar event
 */
export const getAppointmentInfo = async (uid: string, appointmentId: string) => {
  try {
    const docRef = doc(db, `users/${uid}/appointments`, appointmentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log(docSnap.data());
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    if (error instanceof FirestoreError) {
      console.error("Firestore error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
};


/**
 * 
 * @param email 
 * @param uid 
 * @returns 
 */
export const syncEventsWithDb = async (email: string | null, uid: string) => {
  try {
    await syncCalendarEventsWithDb({ email, uid });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}