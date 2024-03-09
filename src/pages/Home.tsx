/**
 * @file Home.tsx
 * @fileoverview the Home page of the application.
 */

import { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonLoading, IonPage, IonTitle, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { SplashScreen } from '@capacitor/splash-screen';

import { useAuthState } from "react-firebase-hooks/auth";

import useAppContext from '../hooks/useContext';
import { CalendarEvent } from '../utils/types';
import FirebaseAuth, { getGoogleCalendarEvents } from '../utils/server';
import HomeAppointmentsList from '../components/Home/HomeAppointmentsList';

import '../components/Home/Home.css';

const Home: React.FC = () => {

  const context = useAppContext();
  const [auth, loading, error] = useAuthState(FirebaseAuth);

  const [events, setEvents] = useState<CalendarEvent[] | null>(null); // null is loading state

  useIonViewWillEnter(() => {
    context.setShowTabs(true);
  }, []);

  useEffect(() => {
    const handleFetchGoogleCalendarEvents = async () => {
      if (auth && auth.email && auth.uid) {
        const res: CalendarEvent[] = await getGoogleCalendarEvents(auth.email);
        setEvents(res);
      } else if (!auth && !loading) {
        console.log("User is not authenticated");
        // toast error
      }
    };
    SplashScreen.hide();
    context.setShowTabs(true);
    handleFetchGoogleCalendarEvents();
  }, [auth]);

  return (
    <IonPage>

      {loading &&
        <IonLoading message="Loading..."></IonLoading>
      }

      <IonHeader>
        <IonToolbar>
          <IonTitle>Upcoming</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size='large'>Upcoming</IonTitle>
          </IonToolbar>
        </IonHeader>

        <HomeAppointmentsList events={events} />

      </IonContent>
    </IonPage>
  );
};

export default Home;
