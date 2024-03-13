import { IonItem, IonList, IonNote, IonSkeletonText, IonCardTitle, useIonRouter, useIonToast, IonLabel, IonSegment, IonSegmentButton, IonContent, IonRefresher, IonRefresherContent, RefresherEventDetail, IonIcon, IonRow, IonFab } from "@ionic/react";
import FadeIn from "@rcnoverwatcher/react-fade-in-react-18/src/FadeIn";

import { convertGoogleCalendarDateTimeToDate, convertGoogleCalendarDateTimeToPST } from "../../utils/convertGoogleCalendarDateTime";
import { stripHtml } from "../../utils/stripHtml";
import { isToday } from "../../utils/isToday";
import { CalendarEvent } from "../../utils/types";

import '../Appointment/Appointment.css';
import { useCallback, useState } from "react";
import FirebaseAuth, { getPastGoogleCalendarEvents } from "../../utils/server";
import { useAuthState } from "react-firebase-hooks/auth";
import { time } from "ionicons/icons";

type AppointmentsListProps = {
  upcomingEvents: CalendarEvent[] | null;
  handleRefreshUpcoming: (event: CustomEvent<RefresherEventDetail>) => Promise<void>;
}

const AppointmentsList = (props: AppointmentsListProps) => {

  const upcomingEvents: CalendarEvent[] | null = props.upcomingEvents;

  const router = useIonRouter();
  const [auth, loading] = useAuthState(FirebaseAuth);
  const [present] = useIonToast();

  const [pastEvents, setPastEvents] = useState<CalendarEvent[] | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null | undefined>(null);

  const [selectedSegment, setSelectedSegment] = useState<string>('Upcoming');

  const handleClickOnAppointment = (id: string | null) => {
    if (!id) {
      present({ message: 'Something went wrong, appointment ID not set', duration: 3000 });
      return;
    }
    router.push('/appointment/' + id);
  };

  const handleGetPastEvents = useCallback(async (email: string | null | undefined, nextPageToken: string | null | undefined) => {
    if (nextPageToken === undefined) { return; } // no more events
    if (!email) {
      present({ message: "User not authenticated, email missing", duration: 3000, color: "danger" });
      return;
    }
    const res = await getPastGoogleCalendarEvents(email, nextPageToken);
    setPastEvents((prev) => {
      if (prev && nextPageToken) {
        return [...prev, ...res.events];
      }
      return res.events;
    });
    if (res.nextPageToken === null) { // no more events}
      setNextPageToken(undefined);
    } else {
      setNextPageToken(res.nextPageToken);
    }
  }, []);

  const handleRefreshPast = async (event: CustomEvent<RefresherEventDetail>) => {
    if (auth && !loading) {
      await handleGetPastEvents(auth.email, null);
    }
    event.detail.complete();
  };

  return (
    <>
      <IonSegment id='appointment-segment' value={selectedSegment} onIonChange={async (e) => {
        setSelectedSegment(e.detail.value as string);
        if (!pastEvents && auth && !loading) {
          await handleGetPastEvents(auth.email, null);
        }
      }}
      >

        <IonSegmentButton value="Upcoming">
          <div className="segment-button" style={{ fontSize: "0.8rem" }}>
            <IonLabel>Upcoming</IonLabel>
          </div>
        </IonSegmentButton>

        <IonSegmentButton value="Past" className="segment-button" style={{ fontSize: "0.8rem" }}>
          <div className="segment-button">
            <IonLabel>Past</IonLabel>
          </div>
        </IonSegmentButton>
      </IonSegment>

      <div style={{ height: '7.5px' }} />

      <IonContent>

        <IonRefresher slot="fixed" onIonRefresh={selectedSegment === 'Upcoming' ? props.handleRefreshUpcoming : handleRefreshPast}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {selectedSegment === 'Upcoming' ?
          <>
            <IonList>
              {upcomingEvents !== null ? upcomingEvents.map((event, index) => (
                <IonItem key={event.title ?? '' + index} button onClick={() => handleClickOnAppointment(event.id)}>
                  <IonFab horizontal="end" vertical="top">
                    {isToday(event.startDateTime) && <span style={{ color: 'var(--ion-color-danger)', fontSize: '0.85rem' }}>Today</span>}
                  </IonFab>
                  <FadeIn>
                    <div className="event-details">
                      <IonCardTitle className="event-title">
                        {event.title || 'No Title'}
                      </IonCardTitle>
                      <IonRow>
                        <span style={{ paddingRight: '5px' }}>{convertGoogleCalendarDateTimeToDate(event.startDateTime)},</span>
                        {convertGoogleCalendarDateTimeToPST(event.startDateTime)} - {convertGoogleCalendarDateTimeToPST(event.endDateTime)}
                      </IonRow>

                      {event.location &&
                        <p className='ion-no-margin'>{event.location}</p>
                      }
                      {event.description &&
                        <p style={{ marginBottom: 0 }}> {event.description && (event.description.length <= 150 ? stripHtml(event.description) : stripHtml(event.description).substring(0, 150) + '...')} </p>
                      }
                      <div style={{ height: "10px" }}></div>
                    </div>
                  </FadeIn>
                </IonItem>
              )) :
                Array.from({ length: 10 }).map((_, index) => (
                  <IonItem key={index}>
                    <div className="skeleton-item">
                      <IonSkeletonText animated style={{ width: '80vw', height: '1.5rem', marginBottom: '15px', marginTop: '15px', borderRadius: '5px' }} />
                      <IonSkeletonText animated style={{ width: '60vw', height: '0.75rem', marginBottom: '1px', borderRadius: '5px' }} />
                      <IonSkeletonText animated style={{ width: '75vw', height: '0.75rem', marginBottom: '1px', borderRadius: '5px' }} />
                      <br />
                      <IonSkeletonText animated style={{ width: '90vw', height: '0.75rem', marginBottom: '1px', borderRadius: '5px' }} />
                      <IonSkeletonText animated style={{ width: '90vw', height: '0.75rem', marginBottom: '10px', borderRadius: '5px' }} />
                    </div>
                  </IonItem>
                ))
              }
            </IonList>

            {upcomingEvents && upcomingEvents.length <= 0 &&
              <div className='center-content'>
                <p className='ion-text-center'>No Upcoming Appointments on Calendar</p>
              </div>
            }
          </>
          :
          <>
            <IonList>
              {pastEvents !== null ? pastEvents.map((event, index) => (
                <IonItem key={event.title ?? '' + index} button onClick={() => handleClickOnAppointment(event.id)}>
                  <IonFab horizontal="end" vertical="top">
                    {isToday(event.startDateTime) && <span style={{ color: 'var(--ion-color-danger)', fontSize: '0.85rem' }}>Today</span>}
                  </IonFab>
                  <FadeIn>
                    <div className="event-details">
                      <IonCardTitle className="event-title">
                        {event.title || 'No Title'}
                      </IonCardTitle>
                      <IonRow>
                        <span style={{ paddingRight: '5px' }}>{convertGoogleCalendarDateTimeToDate(event.startDateTime)},</span>
                        {convertGoogleCalendarDateTimeToPST(event.startDateTime)} - {convertGoogleCalendarDateTimeToPST(event.endDateTime)}
                      </IonRow>

                      {event.location &&
                        <p className='ion-no-margin'>{event.location}</p>
                      }
                      {event.description &&
                        <p style={{ marginBottom: 0 }}> {event.description && (event.description.length <= 150 ? stripHtml(event.description) : stripHtml(event.description).substring(0, 150) + '...')} </p>
                      }
                      <div style={{ height: "10px" }}></div>
                    </div>
                  </FadeIn>
                </IonItem>
              )) :
                Array.from({ length: 10 }).map((_, index) => (
                  <IonItem key={index}>
                    <div className="skeleton-item">
                      <IonSkeletonText animated style={{ width: '80vw', height: '1.5rem', marginBottom: '15px', marginTop: '15px', borderRadius: '5px' }} />
                      <IonSkeletonText animated style={{ width: '92.5vw', height: '0.75rem', marginBottom: '1px', borderRadius: '5px' }} />
                      <IonSkeletonText animated style={{ width: '92.5vw', height: '0.75rem', marginBottom: '1px', borderRadius: '5px' }} />
                      <IonSkeletonText animated style={{ width: '92.5vw', height: '0.75rem', marginBottom: '1px', borderRadius: '5px' }} />
                      <IonSkeletonText animated style={{ width: '92.5vw', height: '0.75rem', marginBottom: '1px', borderRadius: '5px' }} />
                      <IonSkeletonText animated style={{ width: '92.5vw', height: '0.75rem', marginBottom: '10px', borderRadius: '5px' }} />
                    </div>
                  </IonItem>
                ))
              }
            </IonList>

            {pastEvents && pastEvents.length <= 0 &&
              <div className='center-content'>
                <p className='ion-text-center'>Something went wrong when accessing calendar.</p>
              </div>
            }
          </>
        }

        <div style={{height: '10vh'}}></div>

      </IonContent>

    </>

  );

};

export default AppointmentsList;