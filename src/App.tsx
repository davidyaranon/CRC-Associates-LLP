import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonIcon, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact, useIonRouter } from '@ionic/react';
import { time, person, calendar } from "ionicons/icons";
import { IonReactRouter } from '@ionic/react-router';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';


import './theme/variables.css';
import './App.css';

import { useCallback, useEffect, useState } from 'react';

import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import Login from './pages/Login';
import Home from './pages/Home';
import FirebaseAuth, { handleUserLogin } from './utils/server';
import useAppContext from './hooks/useContext';
import useTabBarVisibility from './hooks/useTabBarVisibility';
import { SplashScreen } from '@capacitor/splash-screen';
import Appointment from './pages/Appointment';
import CurrentUser from './pages/CurrentUser';
import useDarkMode from './hooks/useDarkMode';

setupIonicReact({ mode: 'ios' });
SplashScreen.show({ showDuration: 2000, fadeInDuration: 300, fadeOutDuration: 300, autoHide: true });

const RoutingSystem = () => {

  const router = useIonRouter();
  const context = useAppContext();
  const { tabBarDisplay, tabBarOpacity } = useTabBarVisibility(context);
  const theme = useDarkMode(context);

  const [currentTab, setCurrentTab] = useState<string>('home');

  useEffect(() => {
    const unsubscribe = FirebaseAuth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login", "root");
      } else {
        await handleUserLogin(user);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <IonTabs className={context.showTabs ? 'tab-bar-visible' : 'tab-bar-hidden'}>
      <IonRouterOutlet>
        <Route exact path="/" render={() => <Redirect to="/login" />} />
        <Route exact path='/home' component={Home} />
        <Route exact path='/login' component={Login} />
        <Route exact path="/currentUser" component={CurrentUser} />
        <Route exact path="/appointment/:appointmentId" component={Appointment} />
      </IonRouterOutlet>

      <IonTabBar
        id='main-tab-bar'
        slot="bottom"
        onIonTabsWillChange={(e) => { setCurrentTab(e.detail.tab); }}
        style={{ display: tabBarDisplay, opacity: tabBarOpacity.toString() }}
      >
        <IonTabButton tab="home" href="/home">
          <IonIcon
            aria-hidden="true"
            icon={calendar}
            color={currentTab == "home" ? "primary" : ""}
            size="large"
          />
        </IonTabButton>
        {/* <IonTabButton tab="Tab2" href="/map">
          <IonIcon
            aria-hidden="true"
            icon={time}
            color={currentTab == "Tab2" ? "primary" : ""}
            size="large"
          />
        </IonTabButton> */}
        <IonTabButton tab="currentUser" href="/currentUser">
          <IonIcon
            aria-hidden="true"
            icon={person}
            color={currentTab == "Tab3" ? "primary" : ""}
            size="large"
          />
        </IonTabButton>
      </IonTabBar>

    </IonTabs>
  );
};

const App: React.FC = () => {

  const handleInitGoogleAuth = useCallback(async () => {
    await GoogleAuth.initialize({
      clientId: '42203963600-gdvmohrf4jh24vmqtmf3qd6ku97n5l5i.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    }).then(() => {
      console.log('init');
    }).catch((err) => {
      console.error(err);
    });
  }, []);

  useEffect(() => {
    handleInitGoogleAuth();
  }, [handleInitGoogleAuth]);

  return (
    <IonApp>
      <IonReactRouter >
        <RoutingSystem />
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
