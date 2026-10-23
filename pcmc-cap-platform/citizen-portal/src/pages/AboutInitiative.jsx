import { useSite } from '../live/siteContext';
import { localText } from '../../../shared/api';

import "./AboutInitiative.css";
import { translations } from "../data/translations";

export default function AboutInitiative({ language }) {
  const t = translations[language];
  const {settings}=useSite();

  return (
    <main className="about-initiative-page">
      <section className="about-initiative-hero">
        <div className="about-initiative-hero-content">
          <p className="about-initiative-label">{t.aboutInitiativeLabel}</p>
          <h1>{t.aboutInitiativeHeading}</h1>
          <div className="about-initiative-line"></div>
          <p>{t.aboutInitiativeIntro}</p>
        </div>
        <div className="about-initiative-shape" aria-hidden="true"></div>
      </section>

      <section className="about-initiative-section">
        <p className="about-initiative-eyebrow">{t.aboutInitiativePurposeLabel}</p>
        <h2>{t.aboutInitiativePurposeHeading}</h2>
        <div className="about-initiative-content">
          <h3>{t.aboutInitiativePurposeTitle}</h3>
          <p>{localText(settings,'initiative',language)||t.aboutInitiativePurposeText}</p>
        </div>
      </section>

      <section className="about-initiative-section about-initiative-secondary">
        <p className="about-initiative-eyebrow">{t.aboutInitiativeApproachLabel}</p>
        <h2>{t.aboutInitiativeApproachHeading}</h2>
        <div className="about-initiative-content">
          <h3>{t.aboutInitiativeApproachTitle}</h3>
          <p>{t.aboutInitiativeApproachText}</p>
        </div>
      </section>
    </main>
  );
}
