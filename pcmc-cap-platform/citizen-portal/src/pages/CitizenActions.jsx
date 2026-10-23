import "./CitizenActions.css";
import { Link } from "react-router-dom";
import { translations } from "../data/translations";

export default function CitizenActions({ language }) {
  const t = translations[language];

  return (
    <div className="actions-page">

      <section className="actions-hero">
        <h1>{t.actionsTitle}</h1>

        <p>{t.actionsDescription}</p>
      </section>

      <section className="actions-section">
        <h2>{t.whatCanYouDo}</h2>

        <div className="actions-grid">

          <div className="action-card">
            <h3>🏠 {t.atHome}</h3>
            <ul>
              <li>{t.saveElectricity}</li>
              <li>{t.conserveWater}</li>
              <li>{t.segregateWaste}</li>
            </ul>
          </div>

          <div className="action-card">
            <h3>🚶 {t.travel}</h3>
            <ul>
              <li>{t.walkCycle}</li>
              <li>{t.usePublicTransport}</li>
              <li>{t.sharedMobility}</li>
            </ul>
          </div>

          <div className="action-card">
            <h3>🌱 {t.greenNeighbourhood}</h3>
            <ul>
              <li>{t.plantTrees}</li>
              <li>{t.supportGreenSpaces}</li>
              <li>{t.communityGreening}</li>
            </ul>
          </div>

          <div className="action-card">
            <h3>♻️ {t.manageWaste}</h3>
            <ul>
              <li>{t.separateWaste}</li>
              <li>{t.compostWaste}</li>
              <li>{t.avoidBurningWaste}</li>
            </ul>
          </div>

          <div className="action-card">
            <h3>💧 {t.saveWater}</h3>
            <ul>
              <li>{t.waterCarefully}</li>
              <li>{t.rainwaterHarvesting}</li>
              <li>{t.reuseWater}</li>
            </ul>
          </div>

          <div className="action-card">
            <h3>🤝 {t.joinCommunity}</h3>
            <ul>
              <li>{t.cleanupPlantation}</li>
              <li>{t.climateEvents}</li>
              <li>{t.shareSuggestions}</li>
            </ul>
          </div>

        </div>
      </section>

      <section className="actions-section">
        <h2>{t.howActionsHelp}</h2>

        <div className="impact-list">

          <div className="impact-item">
            <strong>{t.impactSegregateWaste}</strong>
            <span>→ {t.impactSegregateWasteText}</span>
          </div>

          <div className="impact-item">
            <strong>{t.impactPublicTransport}</strong>
            <span>→ {t.impactPublicTransportText}</span>
          </div>

          <div className="impact-item">
            <strong>{t.impactElectricity}</strong>
            <span>→ {t.impactElectricityText}</span>
          </div>

          <div className="impact-item">
            <strong>{t.impactTrees}</strong>
            <span>→ {t.impactTreesText}</span>
          </div>

          <div className="impact-item">
            <strong>{t.impactWater}</strong>
            <span>→ {t.impactWaterText}</span>
          </div>

          <div className="impact-item">
            <strong>{t.impactBurning}</strong>
            <span>→ {t.impactBurningText}</span>
          </div>

        </div>
      </section>

      <section className="actions-section get-involved-prompt">
        <h2>{t.wantToDoMore}</h2>

        <p>{t.wantToDoMoreText}</p>

        <Link to="/get-involved">
          {t.getInvolvedArrow}
        </Link>
      </section>

    </div>
  );
}