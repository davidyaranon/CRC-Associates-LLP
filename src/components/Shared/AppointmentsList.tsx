import { IonItem, IonList, IonNote, IonSkeletonText, IonCardTitle, useIonRouter, useIonToast, IonFab } from "@ionic/react";
import FadeIn from "@rcnoverwatcher/react-fade-in-react-18/src/FadeIn";

import { convertGoogleCalendarDateTimeToDate, convertGoogleCalendarDateTimeToPST } from "../../utils/convertGoogleCalendarDateTime";
import { stripHtml } from "../../utils/stripHtml";
import { isToday } from "../../utils/isToday";
import { CalendarEvent } from "../../utils/types";


type AppointmentsListProps = {
  events: CalendarEvent[] | null;
}

const AppointmentsList = (props: AppointmentsListProps) => {

  const events: CalendarEvent[] | null = props.events;

  const router = useIonRouter();
  const [present] = useIonToast();

  const handleClickOnAppointment = (id: string | null) => {
    if (!id) {
      present({ message: 'Something went wrong, appointment ID not set', duration: 3000 });
      return;
    }
    router.push('/appointment/' + id);
  }

  return (
    <>
      <IonList>
        {events !== null ? events.map((event, index) => (
          <IonItem key={event.title ?? '' + index} button onClick={() => handleClickOnAppointment(event.id)}>
            <FadeIn>
              <div className="event-details">
                <IonCardTitle className="event-title">
                  {event.title || 'No Title'}
                  {isToday(event.startDateTime) && <span style={{ color: 'var(--ion-color-danger)' }}> (Today)</span>}
                </IonCardTitle>
                <IonNote className='event-date'>
                  <span style={{ color: 'var(--ion-color-dark)' }}>Date: </span>
                  {convertGoogleCalendarDateTimeToDate(event.startDateTime)}
                </IonNote>
                <IonNote className="event-time">
                  <span style={{ color: 'var(--ion-color-dark)' }}>Time: </span>
                  {convertGoogleCalendarDateTimeToPST(event.startDateTime)} - {convertGoogleCalendarDateTimeToPST(event.endDateTime)}
                </IonNote>
                {event.location &&
                  <IonNote className="event-location"><span style={{ color: 'var(--ion-color-dark)' }}>Location: </span>{event.location}</IonNote>
                }
                {event.description &&
                  <IonNote className="event-description">
                    <span style={{ color: 'var(--ion-color-dark)' }}>Description: </span>
                    {event.description && (event.description.length <= 150 ? stripHtml(event.description) : stripHtml(event.description).substring(0, 150) + '...')}
                  </IonNote>
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

      {
        events && events.length <= 0 &&
        <div className='center-content'>
          <p className='ion-text-center'>No Upcoming Appointments on Calendar</p>
        </div>
      }
    </>

  );

};

export default AppointmentsList;