import { useSite } from '../live/siteContext';
import { localText } from '../../../shared/api';

import "./AboutCEE.css";
import { translations } from "../data/translations";

export default function AboutCEE({ language }) {
  const t = translations[language];
  const {settings}=useSite();

  return (
    <main className="about-cee-page">
      <section className="about-cee-hero">
        <div className="about-cee-hero-content">
          <p className="about-cee-label">{t.aboutCEELabel}</p>
          <h1>{t.aboutCEEHeading}</h1>
          <div className="about-cee-line"></div>
          <p>{t.aboutCEEIntro}</p>
        </div>
        <div className="about-cee-shape" aria-hidden="true"></div>
      </section>

      <section className="about-cee-section">
        <div className="about-cee-section-heading">
          <p className="about-cee-eyebrow">{t.aboutCEESectionLabel}</p>
          <h2>{t.aboutCEESectionTitle}</h2>
        </div>
        <div className="about-cee-content-placeholder">
          <h3>{t.aboutCEEContentHeading}</h3>
          <p>{localText(settings,'about',language)||t.aboutCEEContentPlaceholder}</p>
        </div>
      </section>

      <section className="about-cee-section about-cee-work-section">
        <div className="about-cee-section-heading">
          <p className="about-cee-eyebrow">{t.aboutCEEWorkLabel}</p>
          <h2>{t.aboutCEEWorkHeading}</h2>
        </div>
        <div className="about-cee-content-placeholder">
          <h3>{t.aboutCEEWorkPlaceholderTitle}</h3>
          <p>{t.aboutCEEWorkPlaceholderText}</p>
        </div>
      </section>

      <section className="about-cee-gallery-section">
        <p className="about-cee-eyebrow">{t.aboutCEEGalleryLabel}</p>
        <h2>{t.aboutCEEGalleryHeading}</h2>
        <div className="about-cee-gallery-placeholder">
          <span>{t.aboutCEEGalleryPlaceholder}</span>
        </div>
      </section>
    </main>
  );
}

