import { IonButton, IonContent, IonPage } from "@ionic/react";
import { googleAuthLogout } from "../utils/server";


const CurrentUser = () => {

  return (
    <IonPage>
      <IonContent>

        <IonButton onClick={googleAuthLogout}>Logout</IonButton>

      </IonContent>
    </IonPage>
  );
};

export default CurrentUser;