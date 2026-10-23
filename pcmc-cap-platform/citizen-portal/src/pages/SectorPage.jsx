import { useRemote } from '../../../shared/useRemote';
import { localText } from '../../../shared/api';
import "./SectorPage.css";
import { useParams, Link } from "react-router-dom";
import sectors from "../data/sectors.json";
import { translations } from "../data/translations";

export default function SectorPage({ language }) {
  const { sectorId } = useParams();
  const t = translations[language];

  const remote=useRemote('publications/?kind=sectors');
  const row=remote.data.find(item=>item.slug===sectorId);
  const fallback=sectors.find(item=>item.id===sectorId);
  const sector=row?{...fallback,...row.data,id:row.slug,title:row.title,
    currentScenario:localText(row.data,'currentScenario',language),currentScenarioMr:localText(row.data,'currentScenario',language),
    whyItMatters:localText(row.data,'whyItMatters',language),
    plannedActions:localText(row.data,'plannedActions',language).split('\n').filter(Boolean),citizenActions:localText(row.data,'citizenActions',language).split('\n').filter(Boolean),relevantAreas:localText(row.data,'relevantAreas',language).split('\n').filter(Boolean)}:fallback;

  if (!sector) {
    return (
      <div className="sector-not-found">
        <h1>{t.sectorNotFound}</h1>
        <Link to="/">{t.backToHome}</Link>
      </div>
    );
  }

  const scenario =
    language === "mr" && sector.currentScenarioMr
      ? sector.currentScenarioMr
      : sector.currentScenario;

  const getMarathiActions = (type) => {
    const actions = t.sectorActions?.[sectorId]?.[type];

    return actions || [];
  };

  const plannedActions =
    language === "mr"
      ? row ? sector.plannedActions : getMarathiActions("planned") || sector.plannedActions
      : sector.plannedActions;

  const citizenActions =
    language === "mr"
      ? row ? sector.citizenActions : getMarathiActions("citizen") || sector.citizenActions
      : sector.citizenActions;

  return (
    <div className="sector-page">
      {/* hero */}
      <section className="sector-hero">
        <div className="sector-hero-content">
          <div className="sector-page-icon">{sector.icon}</div>

          <span className="sector-label">
            {t.sectorLabel}
          </span>

          <h1>
            {language === "mr"
              ? {
                  "rising-heat": t.risingHeat,
                  "flooding-water-logging": t.flooding,
                  "solid-waste-management": t.solidWaste,
                  "green-city-biodiversity": t.greenCity,
                  "sustainable-mobility": t.sustainableMobility,
                  "renewable-energy": t.renewableEnergy,
                  "water-security-conservation": t.waterConservation,
                  "clean-air-healthy-life": t.cleanAir
                }[sectorId]
              : sector.title}
          </h1>

          <p>{t.sectorHeroText}</p>
        </div>
      </section>

      {/* what's happening */}
      <section className="sector-feature-section">
        <div className="sector-feature-visual">
          <div className="visual-circle">
            <span>{sector.icon}</span>
          </div>

          <div className="visual-dots"></div>
        </div>

        <div className="sector-feature-text">
          <span className="sector-number">01</span>
          <h2>{t.whatsHappening}</h2>
          <p>{scenario}</p>
        </div>
      </section>

      {/* why it matters */}
      <section className="sector-why-section">
        <div className="sector-section-heading">
          <span>02</span>
          <h2>{t.whyItMatters}</h2>
        </div>

        <div className="why-content">
          <div className="why-mark">“</div>

          <p>{sector.whyItMatters}</p>
        </div>
      </section>

      {/* planned actions */}
      <section className="sector-actions-section">
        <div className="sector-section-heading">
          <span>03</span>
          <h2>{t.plannedActions}</h2>
        </div>

        <div className="action-list">
          {plannedActions.map((action, index) => (
            <div className="action-row" key={index}>
              <span className="action-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="action-text">
                {action}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* citizen actions */}
      <section className="citizen-section">
        <div className="citizen-inner">
          <div className="sector-section-heading light-heading">
            <span>04</span>
            <h2>{t.citizenActions}</h2>
          </div>

          <div className="citizen-actions-grid">
            {citizenActions.map((action, index) => (
              <div className="citizen-action" key={index}>
                <span className="citizen-icon">
                  {["🌱", "💧", "🌿", "🤝", "⚡"][index % 5]}
                </span>

                <p>{action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* relevant areas */}
      <section className="sector-location-section">
        <div className="sector-section-heading">
          <span>05</span>
          <h2>{t.relevantAreas}</h2>
        </div>

        <div className="location-content">
          <div className="location-list">
            {sector.relevantAreas ? (
              sector.relevantAreas.map((area,index) => (
                <span key={index}>{area}</span>
              ))
            ) : (
              <span>
                {language === "mr" ? "संपूर्ण शहर" : "City-wide"}
              </span>
            )}
          </div>

          <Link className="map-link" to="/climate-map">
            {t.exploreClimateMap}
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* bottom navigation */}
      <section className="sector-bottom">
        <Link to="/">
          ← {t.backToClimateIssues}
        </Link>
      </section>
    </div>
  );
}