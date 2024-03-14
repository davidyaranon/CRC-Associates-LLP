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
  runTransaction, doc, getDoc, getFirestore, setDoc, updateDoc, DocumentReference, FirestoreError, arrayUnion
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, getStorage, deleteObject, StorageReference } from 'firebase/storage';
import { uuidv4 } from "@firebase/util";


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
const storage = getStorage();
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
import { AppointmentInfo, CalendarEvent } from "./types";

const functions = getFunctions();
const fetchCalendarEvents = httpsCallable(functions, 'fetchCalendarEvents');
const fetchAppointmentInfo = httpsCallable(functions, 'fetchAppointmentInfo');
const fetchPastCalendarEvents = httpsCallable(functions, 'fetchPastCalendarEvents');
const syncCalendarEventWithDb = httpsCallable(functions, 'syncCalendarEventWithDb');




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
 * @param {string} email the user's email, used as the calendar ID.
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
 * @function getPastGoogleCalendarEvents 
 * @description fetches the past events from the user's Google Calendar, starting from yesterday and going backwards in time.
 * 
 * @param {string} email the user's emai, used as the calendar ID.
 * @returns {Promise<{ events: CalendarEvent[], nextPageToken: string | null }>} the event list and a token for the next page.
 */
export const getPastGoogleCalendarEvents = async (email: string, nextPageToken: string | null = null): Promise<{ events: CalendarEvent[], nextPageToken: string | null }> => {
  try {
    const result = await fetchPastCalendarEvents({ email, nextPageToken });
    const events: { events: CalendarEvent[], nextPageToken: string | null } = result.data as { events: CalendarEvent[], nextPageToken: string | null }
    console.log(events);
    return events;
  } catch (error) {
    console.error('Error fetching calendar events!', error);
    return { events: [], nextPageToken: null };
  }
};



/**
 * @function getAppointmentInfo
 * @description gets the information about the certain appointment at /users/{uid}/appointments/{appointmentId},
 * or if it doesn't exist, return null.
 * 
 * @param {string} uid the user's UID
 * @param {string} appointmentId the id of the calendar event
 * @returns {Promise<AppointmentInfo | null>} the appointment info or null if the ID does not exist in the DB.
 */
export const getAppointmentInfo = async (uid: string, appointmentId: string): Promise<AppointmentInfo | null> => {
  try {
    const res = await fetchAppointmentInfo({ uid, appointmentId })
    console.log(res.data);
    return res.data as AppointmentInfo | null;
  } catch (err) {
    console.error(err);
    return null;
  }
};



/**
 * @function syncEventWithDb 
 * @description called when the database does not have a Document relating to the Google Calendar event.
 * Syncs the information from the event to the Firestore database.
 * 
 * @param {string} email the user's email, used as the calendar ID.
 * @param {string} uid the user's UID
 * @param {string} appointmentId the ID of the Google Calendar appointment, used as doc ID.
 * @returns {boolean} true if the database sync is successful, false otherwise
 */
export const syncEventWithDb = async (email: string | null, uid: string, appointmentId: string): Promise<boolean> => {
  try {
    const res = await syncCalendarEventWithDb({ email, uid, appointmentId });
    console.info(res);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};


/**
 * @function deleteStorageRef
 * @description helper function to delete the storage reference in case of a failure in photo uploads.
 * 
 * @param ref 
 */
const deleteStorageRef = async (ref: StorageReference) => {
  try {
    await deleteObject(ref);
    console.log(`Deleted file at ${ref.fullPath}`);
  } catch (error) {
    console.error(`Failed to delete file at ${ref.fullPath}:`, error);
    // Handle any errors here, such as logging them or re-throwing them
    throw error;
  }
};


/**
 * @function handleAddImagesToAppointment
 * @description adds photos to Firebase storage at /{uid}/appointments/{appointmentId{
 * and appends to the photoUrls document field in the Firestore DB at /users/{uid}/appointments/{appointmentId}
 * 
 * @param {Blob[]} blobArr the array of photo data
 * @param {string} uid
 * @param {stirng} appointmentId
 */
export const handleAddImagesToAppointment = async (blobArr: Blob[], uid: string | undefined, appointmentId: string) => {
  const appointmentRef = doc(db, `users/${uid}/appointments/${appointmentId}`);
  try {
    if (!uid) throw new Error('User not authenticated!');
    for (let i = 0; i < blobArr.length; i++) {
      const blob: Blob = blobArr[i];
      const photoId: string = uuidv4();
      const imageRef = ref(storage, `${uid}/appointments/${appointmentId}/${photoId}-${Date.now()}-${i}`);
      const snapshot = await uploadBytes(imageRef, blob);
      const photoURL = await getDownloadURL(snapshot.ref);
      await updateDoc(appointmentRef, {
        photoUrls: arrayUnion(photoURL)
      });
    }
  } catch (error) {
    console.error("Error adding images to appointment:", error);
    throw error;
  }
};


/**
 * @function saveNotesToAppointment
 * @description updates the notes document field at /users/{uid}/appointments/{appointmentId}
 * 
 * @param {string} notes
 * @param {string | undefined} uid
 * @param {string} appointmentId
 * @returns {Promise<boolean>} whether the update was successful
 */
export const saveNotesToAppointment = async (notes: string, uid: string | undefined, appointmentId: string,) => {
  try {
    if (!uid) throw new Error("User is not authenticated");
    const appointmentRef = doc(db, `users/${uid}/appointments/${appointmentId}`);
    await updateDoc(appointmentRef, { notes: notes });
    return true;
  } catch (err) {
    console.error("Error saving notes to appointment!", err);
    return false;
  }
};