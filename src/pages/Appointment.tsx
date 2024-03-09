import { IonContent, IonLoading, IonPage, IonTitle } from "@ionic/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FirebaseAuth, { getAppointmentInfo, syncEventsWithDb } from "../utils/server";
import { useAuthState } from "react-firebase-hooks/auth";


type AppointmentPageParams = {
  appointmentId: string;
}

const Appointment = () => {
  const params = useParams<AppointmentPageParams>();
  const appointmentId: string = params.appointmentId;

  const [auth, loading] = useAuthState(FirebaseAuth);
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  useEffect(() => {
    const handleViewAppointment = async (email: string | null, uid: string, appointmentId: string) => {
      const res = await getAppointmentInfo(uid, appointmentId);
      if (!res) {
        await syncEventsWithDb(email, uid);
        window.location.reload();
        return;
      }
      setPageLoading(false);
    };

    if (!loading && auth && appointmentId) {
      handleViewAppointment(auth.email, auth.uid, appointmentId);
    }
  }, [auth, loading, appointmentId])

  return (
    <IonPage>
      <IonContent>
        {pageLoading &&
          <IonLoading message="Loading Appointment..."></IonLoading>
        }
        
      </IonContent>
    </IonPage>
  )
};

export default Appointment;