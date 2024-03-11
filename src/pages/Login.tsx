/**
 * @file Login.tsx
 * @fileoverview the login page (and first page seen when opening the app if not already authenticated).
 */

import { IonContent, IonPage, useIonLoading, useIonRouter, useIonViewWillEnter } from "@ionic/react"
import LoginGoogleButton from "../components/Login/LoginGoogleButton"

import '../components/Login/Login.css';
import { useAuthState } from "react-firebase-hooks/auth";
import FirebaseAuth from "../utils/server";
import { useEffect, useState } from "react";
import useAppContext from "../hooks/useContext";
import { SplashScreen } from "@capacitor/splash-screen";

const Login: React.FC = () => {

  const router = useIonRouter();
  const context = useAppContext();
  const [present, dismiss] = useIonLoading();
  const [auth, loading] = useAuthState(FirebaseAuth);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!auth && !loading) {
      SplashScreen.hide();
    }
    if (auth) {
      dismiss();
      router.push("/home", "root");
    }
    if (isLoading) {
      present("Logging in...");
    }
    if (!isLoading) {
      dismiss();
    }
  }, [router, auth, isLoading]);

  useIonViewWillEnter(() => {
    context.setShowTabs(false);
  })

  return (
    <IonPage>
      <IonContent scrollY={false}>
        <div className='center-content-login'>
          <section className='center-container'>

            {!auth && !loading &&
              <LoginGoogleButton setIsLoading={setIsLoading} />
            }

          </section>
        </div>
      </IonContent>
    </IonPage>
  )
};

export default Login;