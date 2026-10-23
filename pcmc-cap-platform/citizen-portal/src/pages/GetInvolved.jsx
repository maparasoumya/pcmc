import { useRef, useState } from 'react';
import CitizenResponseDialog from '../live/CitizenResponseDialog';
import { useRemote } from '../../../shared/useRemote';
import { activeEvents, localText } from '../../../shared/api';
import "./GetInvolved.css";
import { translations } from "../data/translations";

export default function GetInvolved({ language }) {
  const t = translations[language];
  const [kind,setKind]=useState("suggestion");const dialog=useRef(null);
  const events=useRemote("publications/?kind=events");
  const upcoming=activeEvents(events.data);
  function openForm(event,type){event.preventDefault();setKind(type);dialog.current.showModal();}

  return (
    <div className="involved-page">
      <CitizenResponseDialog dialogRef={dialog} kind={kind} language={language}/>

      <section className="involved-hero">
        <div className="hero-badge">PCMC • COMMUNITY</div>

        <h1>{t.involvedTitle}</h1>

        <p>{t.involvedDescription}</p>
      </section>

      <section className="involved-section voice-section">
        <div className="section-heading">
          <span>01</span>
          <h2>{t.shareYourVoice}</h2>
        </div>

        <div className="involved-grid">

          <div className="involved-card suggestion-card">
            <div className="card-icon">💡</div>

            <h3>{t.shareSuggestion}</h3>

            <p>{t.shareSuggestionText}</p>

            <a
              href="?form=suggestion" onClick={event=>openForm(event,"suggestion")}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.suggestionForm}
            </a>
          </div>

          <div className="involved-card query-card">
            <div className="card-icon">❓</div>

            <h3>{t.askQuery}</h3>

            <p>{t.askQueryText}</p>

            <a
              href="?form=query" onClick={event=>openForm(event,"query")}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.queryForm}
            </a>
          </div>

        </div>
      </section>

      <section id="upcoming-events" className="events-section">
        <div className="events-inner">

          <div className="section-heading light-heading">
            <span>02</span>
            <h2>{t.upcomingEvents}</h2>
          </div>

          {upcoming.map(row=><div className="event-placeholder" key={row.id}><div className="event-icon">📅</div><div><h3>{row.title}</h3><p>{localText(row.data,'description',language)}</p><span>{new Date(row.data.date).toLocaleDateString(language==='mr'?'mr-IN':'en-IN')} · {row.data.location}</span></div></div>)}
          {!upcoming.length&&<div className="event-placeholder">

            <div className="event-icon">📅</div>

            <div>
              <h3>{t.climateEventsTitle}</h3>

              <p>{t.climateEventsText}</p>

              <span>{t.eventInformation}</span>
            </div>

          </div>}

        </div>
      </section>

      <section className="involved-section community-section">

        <div className="section-heading">
          <span>03</span>
          <h2>{t.communityParticipation}</h2>
        </div>

        <div className="involved-grid">

          <div className="involved-card community-card">
            <div className="card-icon">🌱</div>

            <h3>{t.joinLocalActivities}</h3>

            <p>{t.joinLocalActivitiesText}</p>
          </div>

          <div className="involved-card community-card">
            <div className="card-icon">🤝</div>

            <h3>{t.volunteer}</h3>

            <p>{t.volunteerText}</p>

            <span>{t.registrationDetails}</span>
          </div>

        </div>

      </section>

      <section className="registration-section">

        <div className="registration-content">

          <div className="registration-icon">🌍</div>

          <h2>{t.registerActivities}</h2>

          <p>{t.registerActivitiesText}</p>

          <span>{t.registrationForm}</span>

        </div>

      </section>

    </div>
  );
}