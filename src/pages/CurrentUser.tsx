import { IonButton, IonContent, IonPage, useIonToast, useIonViewWillEnter } from "@ionic/react";
import FirebaseAuth, { getPastGoogleCalendarEvents, googleAuthLogout, syncEventWithDb } from "../utils/server";
import useAppContext from "../hooks/useContext";
import { useCallback, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import AppointmentsList from "../components/Shared/AppointmentsList";
import { CalendarEvent } from "../utils/types";


const CurrentUser = () => {

  const context = useAppContext();
  const [auth, loading] = useAuthState(FirebaseAuth);
  const [present] = useIonToast();

  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null | undefined>(null);

  useIonViewWillEnter(() => {
    context.setShowTabs(true);
  }, [])

  const handleGetPastEvents = useCallback(async (email: string | null | undefined, nextPageToken: string | null | undefined) => {
    if (nextPageToken === undefined) { return; } // no more events
    if (!email) {
      present({ message: "User not authenticated, email missing", duration: 3000, color: "danger" });
      return;
    }
    const res = await getPastGoogleCalendarEvents(email, nextPageToken);
    setEvents((prev) => {
      if (prev) {
        return [...prev, ...res.events];
      }
      return res.events;
    });
    if (res.nextPageToken === null) { // no more events}
      setNextPageToken(undefined);
    } else {
      setNextPageToken(res.nextPageToken);
    }
  }, []);

  useEffect(() => {
    if (!loading && auth) {
      handleGetPastEvents(auth.email, null)
    }
  }, [auth, loading, handleGetPastEvents]);

  return (
    <IonPage>
      <IonContent>

        <IonButton onClick={googleAuthLogout}>Logout</IonButton>
        <IonButton onClick={() => handleGetPastEvents(auth?.email, nextPageToken)}>Get next batch</IonButton>

        <AppointmentsList events={events} />


      </IonContent>
    </IonPage>
  );
};

export default CurrentUser;