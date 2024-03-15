import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonModal, IonTitle, IonToolbar } from "@ionic/react";
import AppointmentSignature from "./AppointmentSignature";
import { useRef, useState } from "react";
import { canDismiss } from "../../utils/canDismiss";

type AppointmentModalProps = {
  presentingElement: HTMLElement | undefined;
  appointmentId: string;
  signatureUrl: string;
  setSignatureUrl: React.Dispatch<React.SetStateAction<string>>;
};


const AppointmentModal = (props: AppointmentModalProps) => {

  const modalRef = useRef<HTMLIonModalElement | null>(null);

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const handleModalDidPresent = () => {
    setModalVisible(true);
  };

  const handleModalDidDismiss = () => {
    setModalVisible(false);
  };
  

  return (
    <IonModal onDidPresent={handleModalDidPresent} onDidDismiss={handleModalDidDismiss} ref={modalRef} trigger='open-appointment-modal' canDismiss={canDismiss}>
      <IonHeader className='ion-no-border'>
        <IonToolbar className='appointment-modal-content'>
          <IonTitle className='appointment-modal-title'>Time Clock</IonTitle>
          <IonButtons>
            <IonButton onClick={() => { modalRef.current?.dismiss(); }}>
              <p>Close</p>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent scrollY={false}>
        <br />
        <IonItem style={{ "--background": "var(--ion-background-color)" }} lines="none">
          <AppointmentSignature signatureUrl={props.signatureUrl} setSignatureUrl={props.setSignatureUrl} appointmentId={props.appointmentId} modalVisible={modalVisible} width='90vw' height='75vh' />
        </IonItem>
      </IonContent>
    </IonModal>
  )

};

export default AppointmentModal;