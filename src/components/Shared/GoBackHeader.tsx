import { IonButton, IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar, useIonRouter } from "@ionic/react"
import { chevronBackOutline } from "ionicons/icons";

type GoBackHeaderProps = {
  title: string;
  titleStyle: any;
  buttons?: any;
  translucent?: boolean;
};

const GoBackHeader: React.FC<GoBackHeaderProps> = (props: GoBackHeaderProps) => {

  const title = props.title || '';
  const router = useIonRouter();

  return (
    <IonHeader className='ion-no-border' translucent={props.translucent}>
      <IonToolbar style={{ '--background': 'var(--ion-toolbar-background)' }}>
        <IonButtons >
          <IonButton style={{ fontSize: '1.15em', marginLeft: '-2.5px' }} onClick={() => { router.goBack(); }}>
            <IonIcon icon={chevronBackOutline} /> <p>Back</p>
          </IonButton>
          <IonTitle style={props.titleStyle ? props.titleStyle : {}}>{title}</IonTitle>
        </IonButtons>
        {props.buttons &&
          <IonButtons slot="end">
            {props.buttons}
          </IonButtons>
        }
      </IonToolbar>
    </IonHeader>

  )

};

export default GoBackHeader;