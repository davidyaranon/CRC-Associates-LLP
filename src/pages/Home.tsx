/**
 * @file Home.tsx
 * @fileoverview the Home page of the application.
 */

import { useCallback, useEffect, useState } from 'react';
import { IonContent, IonHeader, IonLoading, IonPage, IonRefresher, IonRefresherContent, IonTitle, IonToolbar, RefresherEventDetail, useIonToast, useIonViewWillEnter } from '@ionic/react';
import { SplashScreen } from '@capacitor/splash-screen';

import { useAuthState } from "react-firebase-hooks/auth";

import useAppContext from '../hooks/useContext';
import { CalendarEvent } from '../utils/types';
import FirebaseAuth, { getGoogleCalendarEvents } from '../utils/server';
import AppointmentsList from '../components/Shared/AppointmentsList';

import '../components/Home/Home.css';

const Home: React.FC = () => {

  const context = useAppContext();
  const [auth, loading, error] = useAuthState(FirebaseAuth);
  const [present] = useIonToast();

  const [events, setEvents] = useState<CalendarEvent[] | null>(null); // null is loading state

  const handleFetchGoogleCalendarEvents = useCallback(async () => {
    if (auth && auth.email && auth.uid) {
      const res: CalendarEvent[] = await getGoogleCalendarEvents(auth.email);
      setEvents(res);
    } else if (!auth && !loading) {
      present({ message: 'User is not authenticated', duration: 3000, color: 'danger' });
    }
  }, [auth]);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => { // called when user swipes down on page
    await handleFetchGoogleCalendarEvents();
    event.detail.complete();
  };

  useIonViewWillEnter(() => {
    context.setShowTabs(true);
  }, []);

  useEffect(() => {
    SplashScreen.hide();
    context.setShowTabs(true);
    handleFetchGoogleCalendarEvents();
  }, [auth, handleFetchGoogleCalendarEvents]);

  return (
    <IonPage>

      <IonLoading message="Loading..." isOpen={loading}></IonLoading>

      <IonHeader>
        <IonToolbar>
          <IonTitle>Upcoming</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>

        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size='large'>Upcoming</IonTitle>
          </IonToolbar>
        </IonHeader>

        <AppointmentsList events={events} />

      </IonContent>
    </IonPage>
  );
};

export default Home;
