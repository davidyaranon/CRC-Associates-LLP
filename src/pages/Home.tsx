/**
 * @file Home.tsx
 * @fileoverview the Home page of the application.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { IonCardTitle, IonContent, IonHeader, IonLoading, IonPage, IonRefresher, IonRefresherContent, IonTitle, IonToolbar, RefresherEventDetail, useIonToast, useIonViewWillEnter } from '@ionic/react';
import { SplashScreen } from '@capacitor/splash-screen';

import { useAuthState } from "react-firebase-hooks/auth";

import useAppContext from '../hooks/useContext';
import { CalendarEvent } from '../utils/types';
import FirebaseAuth, { getGoogleCalendarEvents } from '../utils/server';
import AppointmentsList from '../components/Shared/AppointmentsList';

import CRC_Logo_v1 from '../assets/images/CRC_Logo_v1.png';

import '../components/Home/Home.css';

const Home: React.FC = () => {

  const context = useAppContext();
  const contentRef = useRef<HTMLIonContentElement | null>(null);
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
    // SplashScreen.hide();
    context.setShowTabs(true);
    handleFetchGoogleCalendarEvents();
  }, [auth, handleFetchGoogleCalendarEvents]);

  return (
    <IonPage className='ion-page-ios-notch'>

      <IonLoading message="Loading..." isOpen={loading}></IonLoading>
      <IonHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '15px' }}>
          <IonCardTitle>Appointments</IonCardTitle>
          <img role='button' onClick={() => contentRef && contentRef.current && contentRef.current.scrollToTop(1000)} src={CRC_Logo_v1} style={{ width: '75px', height: 'auto', marginRight: '7.5px', marginBottom: '1px' }} />
        </div>
      </IonHeader>

      <IonContent fullscreen scrollY={false}>
        <AppointmentsList contentRef={contentRef} upcomingEvents={events} handleRefreshUpcoming={handleRefresh} />
      </IonContent>

    </IonPage>
  );
};

export default Home;
