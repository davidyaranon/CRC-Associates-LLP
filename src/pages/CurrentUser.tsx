import { IonAvatar, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonToggle, IonToolbar, useIonAlert, useIonViewWillEnter } from "@ionic/react";
import FirebaseAuth, { googleAuthLogout } from "../utils/server";
import useAppContext from "../hooks/useContext";
import { useAuthState } from "react-firebase-hooks/auth";
import { chatbubblesOutline, trophyOutline, notificationsOutline, informationCircleOutline, cameraReverseOutline, moonOutline } from "ionicons/icons";
import FadeIn from "@rcnoverwatcher/react-fade-in-react-18/src/FadeIn";
import { Keyboard, KeyboardStyle, KeyboardStyleOptions } from "@capacitor/keyboard";
import { Preferences } from "@capacitor/preferences";
import { StatusBar, Style } from "@capacitor/status-bar";

const keyStyleOptionsLight: KeyboardStyleOptions = {
  style: KeyboardStyle.Light
};
const keyStyleOptionsDark: KeyboardStyleOptions = {
  style: KeyboardStyle.Dark
};

const CurrentUser = () => {

  const context = useAppContext();
  const [auth, loading] = useAuthState(FirebaseAuth);

  const [presentAlert] = useIonAlert();

  useIonViewWillEnter(() => {
    context.setShowTabs(true);
  }, []);

  /**
   * @description updates the dark mode values in context and Capacitor Preferences (localStorage).
   * The document body class list, status bar, and keyboard styles are updated to reflect 
   * the selection between light and dark mode.
   * 
   * @param {boolean} isChecked whether the toggle was enabled or disabled by the user.
   */
  const toggleDarkMode = async (isChecked: boolean): Promise<void> => {
    context.setDarkMode(isChecked);
    await Preferences.set({ key: 'darkMode', value: JSON.stringify(isChecked) });
    if (isChecked) {
      document.body.classList.add('dark');
      await StatusBar.setStyle({ style: Style.Dark });
      await Keyboard.setStyle(keyStyleOptionsDark);
    } else {
      document.body.classList.remove('dark');
      await StatusBar.setStyle({ style: Style.Light });
      await Keyboard.setStyle(keyStyleOptionsLight);
    }
  };

  /**
   * @description presents the user with an alert to confirm logout.
   */
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

        <IonToolbar mode="ios" style={{ height: "5vh", '--background' : '--ion-background-color' }}>
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
        </IonToolbar>
        <IonHeader mode="ios" class="ion-no-border" style={{ textAlign: "center", }}>
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

        <IonList lines='full'>
          <IonItem>
            <IonIcon aria-hidden='true' icon={moonOutline} slot='start' ></IonIcon>
            <IonLabel><IonToggle checked={context.darkMode} onIonChange={(e) => { toggleDarkMode(e.detail.checked) }}>Dark Mode</IonToggle></IonLabel>
          </IonItem>
        </IonList>

      </IonContent>
    </IonPage>
  );
};

export default CurrentUser;