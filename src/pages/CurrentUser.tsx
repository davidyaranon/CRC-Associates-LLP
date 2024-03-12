import { IonAvatar, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonImg, IonPage, IonText, IonToolbar, useIonAlert, useIonViewWillEnter } from "@ionic/react";
import FirebaseAuth, { googleAuthLogout } from "../utils/server";
import useAppContext from "../hooks/useContext";
import { useAuthState } from "react-firebase-hooks/auth";
import { chatbubblesOutline, trophyOutline, notificationsOutline, informationCircleOutline, cameraReverseOutline } from "ionicons/icons";
import FadeIn from "@rcnoverwatcher/react-fade-in-react-18/src/FadeIn";


const CurrentUser = () => {

  const context = useAppContext();
  const [auth, loading] = useAuthState(FirebaseAuth);

  const [presentAlert] = useIonAlert();

  useIonViewWillEnter(() => {
    context.setShowTabs(true);
  }, []);

  const handleLogout = async () => {
    presentAlert({
      cssClass: 'ion-alert-logout',
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons:
        [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'alert-cancel-button',
          },
          {
            text: 'Logout',
            handler: async () => {
              await googleAuthLogout();
            },
          },
        ]
    })

  }


  return (
    <IonPage className='ion-page-ios-notch'>
      <IonContent>

        <IonToolbar mode="ios" style={{ height: "5vh" }}>
          <IonButtons slot="start">
            <IonButton
              onClick={handleLogout}
              color="danger"
              fill="clear"
            >
              Logout
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton
              color={"primary"}
              onClick={() => {
              }}
            >
              <IonIcon icon={notificationsOutline}></IonIcon>
            </IonButton>
            <IonButton
              color={"primary"}
              onClick={() => {
              }}
            >
              <IonIcon icon={informationCircleOutline}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar><IonHeader mode="ios" class="ion-no-border" style={{ textAlign: "center", }}>
          <IonAvatar className="user-avatar-settings">
            <IonImg src={auth?.photoURL ?? ''}></IonImg>
          </IonAvatar>
        </IonHeader>

        {auth &&
          <FadeIn delay={500}>
            <p style={{ fontSize: "1.4em", textAlign: "center", fontWeight: 'bolder' }}>
              Hello,
              <IonText color={"primary"}>&nbsp;{auth.displayName}</IonText>
            </p>
          </FadeIn>
        }


      </IonContent>
    </IonPage>
  );
};

export default CurrentUser;