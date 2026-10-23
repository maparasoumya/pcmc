import { useRemote } from '../../../../shared/useRemote';
import { activeEvents, localText, safeUrl } from '../../../../shared/api';

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { translations } from "../../data/translations";
import "./EventAnnouncement.css";

export default function EventAnnouncement({ language }) {
  const t = translations[language];
  const remote=useRemote("publications/?kind=events");
  const event=activeEvents(remote.data)[0];
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer=setTimeout(()=>setShowPopup(isHomePage&&!sessionStorage.getItem('eventAnnouncementDismissed')),0);
    return()=>clearTimeout(timer);
  }, [isHomePage]);

  function closePopup() {
    setShowPopup(false);
    sessionStorage.setItem("eventAnnouncementDismissed", "true");
  }



  return (
    <>
      <section className="event-announcement-banner">
        <div className="event-banner-content">
          <span className="event-banner-label">
            {t.eventBannerLabel}
          </span>

          <div className="event-banner-text">
            <h2>{event?localText({...event.data,title:event.title},'title',language):t.eventBannerTitle}</h2>
            <p>{event?localText(event.data,'description',language):t.eventBannerDescription}</p>
          </div>
 
          <button
            className="event-banner-button"
            onClick={() => setShowPopup(true)}
          >
            {t.eventBannerButton}
            <span aria-hidden="true"> →</span>
          </button>
        </div>
      </section>

      {showPopup && (
        <div
          className="event-popup-overlay"
          onClick={closePopup}
        >
          <section
            className="event-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-popup-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="event-popup-close"
              onClick={closePopup}
              aria-label={t.eventPopupClose}
            >
              ×
            </button>

            <span className="event-popup-eyebrow">
              {t.eventPopupEyebrow}
            </span>

            {event&&safeUrl(event.data.image)&&<img src={safeUrl(event.data.image)} alt={event.title} style={{width:'100%',maxHeight:250,objectFit:'contain'}}/>}
            <div className="event-popup-icon" aria-hidden="true">
              <span>🌿</span>
            </div>

            <h2 id="event-popup-title">{event?localText({...event.data,title:event.title},'title',language):t.eventPopupTitle}</h2>
            <p>{event?localText(event.data,'description',language):t.eventPopupDescription}</p>

            <div className="event-popup-actions">
                <button
                    className="event-popup-button"
                    onClick={closePopup}
                >
                    {t.eventPopupButton}
                </button>

                <button
                    className="event-popup-more-button"
                    onClick={() => {
                    closePopup();
                    navigate("/get-involved#upcoming-events");
                    }}
                >
                    {t.eventPopupMoreInfo} →
                </button>
            </div>

            <small className="event-popup-note">
              {event?`${new Date(event.data.date).toLocaleString(language==='mr'?'mr-IN':'en-IN')} · ${event.data.location||''}`:'Event information will be updated when confirmed.'}
            </small>
          </section>
        </div>
      )}
    </>
  );
}
