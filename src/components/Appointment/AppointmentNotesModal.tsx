import { IonButton, IonButtons, IonContent, IonFab, IonHeader, IonModal, IonRow, IonTitle, IonToolbar, useIonAlert, useIonLoading, useIonToast } from "@ionic/react";
import { useRef } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { timeout } from "../../utils/timeout";
import { saveNotesToAppointment } from "../../utils/server";

type AppointmentNotesModalProps = {
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  originalNotes: string;
  setOriginalNotes: React.Dispatch<React.SetStateAction<string>>;
  uid: string | undefined;
  appointmentId: string;
};

const AppointmentNotesModal = (props: AppointmentNotesModalProps) => {

  const modalRef = useRef<HTMLIonModalElement | null>(null);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();

  const handleSaveNotes = async () => {
    if (!props.uid || !props.appointmentId) {
      presentToast({ message: "Something went wrong when saving notes", duration: 3000, color: 'danger' });
      return;
    }
    await presentLoading({ message: "Saving..." });
    const res = await saveNotesToAppointment(props.notes, props.uid, props.appointmentId);
    if (!res) {
      presentToast({ message: "Something went wrong when saving notes", duration: 3000, color: 'danger' });
    } else {
      props.setOriginalNotes(props.notes);
    }
    await dismissLoading();
  }

  const handleCloseNotesModal = async () => {
    if (props.originalNotes !== props.notes) {
      await presentAlert({
        cssClass: 'ion-alert-logout',
        header: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to exit?',
        buttons:
          [
            {
              text: 'Exit without saving',
              role: 'cancel',
              cssClass: 'alert-cancel-button',
              handler: () => {
                timeout(350).then(() => {
                  props.setNotes(props.originalNotes);
                  modalRef.current && modalRef.current.dismiss();
                });
              }
            },
            {
              text: 'Save Changes',
              handler: () => {
                timeout(350).then(async () => {
                  await handleSaveNotes();
                  modalRef.current && modalRef.current.dismiss();
                });
              },
            },
          ]
      });
    } else {
      modalRef.current && modalRef.current.dismiss();
    }
  };

  return (
    <IonModal ref={modalRef} trigger='open-notes-modal'>
      <IonHeader className='ion-no-border'>
        <IonToolbar className='appointment-modal-content'>
          <IonTitle className='appointment-modal-title'>Notes</IonTitle>
          <IonButtons>
            <IonButton className='appointment-modal-close-button' onClick={handleCloseNotesModal}>
              <p>Close</p>
            </IonButton>
          </IonButtons>
          <IonButtons slot='end'>
            <IonButton disabled={props.originalNotes === props.notes} onClick={handleSaveNotes}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent scrollY={false}>
        <br />
        <div style={{ marginLeft: '10px', marginRight: '10px' }}>
          <ReactQuill theme='snow' value={props.notes} onChange={props.setNotes} style={{ height: '67.5vh', borderRadius: '10px' }} />
        </div>
      </IonContent>
    </IonModal>
  );
};

export default AppointmentNotesModal;