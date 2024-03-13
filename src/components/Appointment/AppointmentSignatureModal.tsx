import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonModal, IonTitle, IonToolbar } from "@ionic/react";
import AppointmentSignature from "./AppointmentSignature";
import { useRef, useState } from "react";
import { canDismiss } from "../../utils/canDismiss";

type AppointmentSignatureModalProps = {
  presentingElement: HTMLElement | undefined;
}


const AppointmentSignatureModal = (props: AppointmentSignatureModalProps) => {

  const modalRef = useRef<HTMLIonModalElement | null>(null);

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const handleModalDidPresent = () => {
    setModalVisible(true);
  };

  const handleModalDidDismiss = () => {
    setModalVisible(false);
  };

  return (
    <IonModal onDidPresent={handleModalDidPresent} onDidDismiss={handleModalDidDismiss} ref={modalRef} trigger='open-appointment-signature-modal' canDismiss={canDismiss}>
      <IonHeader className='ion-no-border'>
        <IonToolbar className='appointment-modal-content'>
          <IonTitle className='appointment-modal-title'>Signature</IonTitle>
          <IonButtons>
            <IonButton className='appointment-modal-close-button' onClick={() => { modalRef.current?.dismiss(); }}>
              <p>Close</p>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent scrollY={false}>
        <br />
        <IonItem style={{ "--background": "var(--ion-background-color)" }} lines="none">
          <AppointmentSignature modalVisible={modalVisible} width='90vw' height='75vh' />
        </IonItem>
      </IonContent>
    </IonModal>
  )

};

export default AppointmentSignatureModal;