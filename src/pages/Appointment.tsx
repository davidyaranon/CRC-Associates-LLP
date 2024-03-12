import { IonCard, IonContent, IonLoading, IonPage, IonCardTitle, useIonToast, IonButton, IonItem, IonCardContent, IonCardHeader, IonIcon, IonLabel, useIonLoading, IonTextarea } from "@ionic/react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Map, Marker, ZoomControl } from "pigeon-maps";

import FirebaseAuth, { getAppointmentInfo, handleAddImagesToAppointment, syncEventWithDb } from "../utils/server";
import { useAuthState } from "react-firebase-hooks/auth";
import GoBackHeader from "../components/Shared/GoBackHeader";
import { mapTiler, zoomControlButtonsStyle, zoomControlButtonsStyleDark } from "../utils/mapConfig";
import { Camera } from "@capacitor/camera";
import FadeIn from "@rcnoverwatcher/react-fade-in-react-18/src/FadeIn";


import '../components/Appointment/Appointment.css';
import { Capacitor } from "@capacitor/core";
import { convertGoogleCalendarDateTimeToDate, convertGoogleCalendarDateTimeToPST } from "../utils/convertGoogleCalendarDateTime";
import { AppointmentInfo } from "../utils/types";
import { cameraOutline, chevronBack } from "ionicons/icons";
import IonPhotoViewer from "@codesyntax/ionic-react-photo-viewer";
import { timeout } from "../utils/timeout";
import { stripHtml } from "../utils/stripHtml";
import SignatureComponent from "../components/Appointment/Signature";
import useAppContext from "../hooks/useContext";

const PHOTO_UPLOAD_LIMIT = 3;

type AppointmentPageParams = {
  appointmentId: string;
}

const Appointment = () => {
  const params = useParams<AppointmentPageParams>();
  const appointmentId: string = params.appointmentId;

  const context = useAppContext();
  const [auth, loading] = useAuthState(FirebaseAuth);
  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  const [appointmentInfo, setAppointmentInfo] = useState<AppointmentInfo | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  const handleSelectImages = async () => {
    const images = await Camera.pickImages({
      quality: 90,
      limit: 5,
      presentationStyle: 'popover'
    });

    if (!images || !images.photos) { return; }
    presentLoading({ message: "Loading..." });
    let blobArr: Blob[] = [];
    let photoArr: string[] = [];
    let limit: number =
      images.photos.length > PHOTO_UPLOAD_LIMIT
        ? PHOTO_UPLOAD_LIMIT
        : images.photos.length;
    for (let i = 0; i < limit; ++i) {
      const image = images.photos[i];
      if (!image.webPath) {
        presentToast({ message: "Something went wrong with one or more of the photos", duration: 2000, color: "danger" });
      }
      const res = await fetch(image.webPath!);
      const blobRes = await res.blob();
      if (blobRes) {
        if (blobRes.size > 15_000_000) {
          // 15 MB
          presentToast({ message: "Image " + (i + 1) + " too large", duration: 2000, color: "danger", });
        } else {
          blobArr.push(blobRes);
          photoArr.push(image.webPath!);
        }
      }
    }
    await handleAddImagesToAppointment(blobArr, auth?.uid, appointmentId);
    setPhotos((prev) => [...prev, ...photoArr]);
    dismissLoading();
  };

  const handleClickOnMarker = (latitude: string, longitude: string, name: string) => {
    if (Capacitor.getPlatform() === 'ios') {
      window.open(`comgooglemaps://?q=${latitude},${longitude}(${name})`, '_system');
    } else if (Capacitor.getPlatform() === 'android') {
      window.open(`geo:${latitude},${longitude}?q=${latitude},${longitude}(${name})`, '_system');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
    }
  };

  const handleViewAppointment = useCallback(async (email: string | null, uid: string, appointmentId: string) => {
    setPageLoading(true);

    try {
      let appointmentData = await getAppointmentInfo(uid, appointmentId);

      if (!appointmentData) {
        const syncResult: boolean = await syncEventWithDb(email, uid, appointmentId);

        if (syncResult) {
          await timeout(1000);
          appointmentData = await getAppointmentInfo(uid, appointmentId);
          if (!appointmentData) {
            throw new Error("Failed to fetch new synced data from database, please try again");
          }
        } else {
          throw new Error("Failed to sync event with the database.");
        }
      }
      setAppointmentInfo(appointmentData);
      setPhotos(appointmentData.photoUrls);
    } catch (error) {
      console.error(JSON.stringify(error));
      console.error("Error:", error);
      presentToast({
        message: "Something went wrong when loading the appointment, please try again",
        duration: 3000,
        color: 'danger'
      });
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && auth && appointmentId) {
      handleViewAppointment(auth.email, auth.uid, appointmentId);
    }
  }, [auth, loading, appointmentId, handleViewAppointment, presentToast]);

  return (
    <IonPage>
      <GoBackHeader title={appointmentInfo && "title" in appointmentInfo ? appointmentInfo.title : ''} />
      <IonContent>

        <IonLoading message="Loading..." isOpen={pageLoading}></IonLoading>

        {!pageLoading && appointmentInfo &&
          <FadeIn>
            {appointmentInfo.latitude && appointmentInfo.longitude &&
              <section className='map-container'>
                <Map
                  provider={(x, y, z, dpr) => mapTiler(context.darkMode, x, y, z, dpr)}
                  center={[appointmentInfo.latitude, appointmentInfo.longitude]}
                >
                  <ZoomControl buttonStyle={context.darkMode ? zoomControlButtonsStyleDark : zoomControlButtonsStyle}></ZoomControl>
                  <Marker onClick={
                    () => handleClickOnMarker(appointmentInfo.latitude.toString(), appointmentInfo.longitude.toString(), appointmentInfo.title)
                  }
                    color='var(--ion-color-primary)'
                    width={35}
                    anchor={[appointmentInfo.latitude, appointmentInfo.longitude]}>

                  </Marker>
                </Map>
              </section>
            }

            <IonItem
              style={{ "--background": "var(--ion-background-color)" }}
              lines="full"
            >
              <IonLabel position="stacked">Appointment Details</IonLabel>
              <div style={{ height: "1vh" }} />
              <section className="appointment-details">
                <p>{convertGoogleCalendarDateTimeToDate(appointmentInfo.startDateTime)}, {convertGoogleCalendarDateTimeToPST(appointmentInfo.startDateTime)} - {convertGoogleCalendarDateTimeToPST(appointmentInfo.endDateTime)}</p>
                <p>{appointmentInfo.location}</p>
                <br />
                <p>{stripHtml(appointmentInfo.description)}</p>
              </section>

            </IonItem>

            <IonItem
              style={{ "--background": "var(--ion-background-color)" }}
              lines="full"
            >
              <IonLabel position="stacked">Photos</IonLabel>
              <div style={{ height: "1vh" }} />
              {photos &&
                photos.length > 0 &&
                photos.map((url: string, index: number) => {
                  return (
                    <div key={index}>
                      <IonCard className="ion-no-margin appointment-fixed-size-card">
                        <IonPhotoViewer
                          title={"Image " + index}
                          icon={chevronBack}
                          src={url}>
                          <img src={url} alt="Appointment Image" />
                        </IonPhotoViewer>
                      </IonCard>
                      <br />
                    </div>
                  );
                })}
              <IonCard onClick={handleSelectImages} className="ion-no-margin appointment-fixed-size-card-add-image">
                <div className='appointment-add-photos-card'>
                  <IonIcon
                    icon={cameraOutline}
                    style={{
                      fontSize: "40px",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -70%)",
                    }}
                  />
                  <div style={{ marginTop: "5vh" }}>Add Photos</div>
                </div>
              </IonCard>
              <div style={{ height: "1vh" }} />
            </IonItem>

            <IonItem
              style={{ "--background": "var(--ion-background-color)" }}
              lines="full"
            >
              <IonLabel position="stacked">Notes</IonLabel>

              <IonTextarea
                value={appointmentInfo.notes}
              />
            </IonItem>


            <IonItem
              style={{ "--background": "var(--ion-background-color)" }}
              lines="full"
            >
              <IonLabel position="stacked">Signature</IonLabel>
              <SignatureComponent />

            </IonItem>

          </FadeIn>
        }
        <br />
      </IonContent>
    </IonPage>
  )
};

export default Appointment;