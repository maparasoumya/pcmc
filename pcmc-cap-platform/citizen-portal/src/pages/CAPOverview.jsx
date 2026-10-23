import "./CAPOverview.css";
import { translations } from "../data/translations";
export default function CAPOverview({ language }) {
  const t = translations[language];
  return (
    <div className="cap-page">

      <section className="cap-hero">

        <div className="cap-hero-content">

          <div className="cap-hero-label">
            {t.capHeroLabel}
          </div>

          <h1>
            <span>{t.capHeroHeading1}</span>
            <br />
            <span>{t.capHeroHeading2}</span>
          </h1>

          <div className="cap-hero-line"></div>

          <p>{t.capHeroDescription}</p>

        </div>

        <div className="cap-hero-year">
          2026
        </div>

        <div className="cap-hero-shape"></div>

      </section>

      <section className="cap-section">
        <h2>{t.capWhatTitle}</h2>

        <p>{t.capWhatText1}</p>

        <p>{t.capWhatText2}</p>
      </section>

      <section className="cap-section">
        <h2>{t.capWhyTitle}</h2>

        <div className="risk-grid">
          <div className="risk-card">
            <h3>🌡️ {t.capExtremeHeat}</h3>
            <p>{t.capExtremeHeatText}</p>     
          </div>

          <div className="risk-card">
            <h3>🌧️ {t.capFlooding}</h3>
            <p>{t.capFloodingText}</p>
          </div>

          <div className="risk-card">
            <h3>💧 {t.capWaterStress}</h3>
            <p>{t.capWaterStressText}</p>
          </div>

          <div className="risk-card">
            <h3>🌫️ {t.capAirPollution}</h3>
            <p>{t.capAirPollutionText}</p>
          </div>
        </div>
      </section>

      <section className="climate-figures-section">

        <div className="figures-heading">

          <div>
            <p className="section-label">
              PCMC • CLIMATE DATA
            </p>

            <h2>{t.capFiguresTitle}</h2>
          </div>

          <p className="figures-intro">
            A snapshot of key climate-related figures shaping
            Pimpri-Chinchwad's Climate Action Plan.
          </p>

        </div>


        <div className="figures-grid">

          <div className="figure-item">
            <strong>36.1</strong>

            <div className="figure-unit">
              lakh
            </div>

            <p>
              {t.capEmissions}
            </p>

            <span>
              {t.capEmissionsText}
            </span>
          </div>


          <div className="figure-item">
            <strong>66</strong>

            <div className="figure-unit">
              %
            </div>

            <p>
              {t.capEnergy}
            </p>

            <span>
              {t.capEnergyText}
            </span>
          </div>


          <div className="figure-item">
            <strong>1,400</strong>

            <div className="figure-unit">
              tonnes/day
            </div>

            <p>
              {t.capWaste}
            </p>

            <span>
              {t.capWasteText}
            </span>
          </div>


          <div className="figure-item">
            <strong>100</strong>

            <div className="figure-unit">
              MLD
            </div>

            <p>
              {t.capWater}
            </p>

            <span>
              {t.capWaterText}
            </span>
          </div>

        </div>

      </section>
      <section className="cap-section">
        <h2>{t.capGoalsTitle}</h2>

        <ul className="goal-list">
          <li>{t.capGoal1}</li>
          <li>{t.capGoal2}</li>
          <li>{t.capGoal3}</li>
          <li>{t.capGoal4}</li>
          <li>{t.capGoal5}</li>
          <li>{t.capGoal6}</li>
          <li>{t.capGoal7}</li>
          <li>{t.capGoal8}</li>
        </ul>
      </section>

      <section className="cap-section">
        <h2>{t.capBudgetTitle}</h2>

        <p>
          {t.capBudgetDescription}
        </p>

        <div className="budget-info">
          <div className="budget-card">
            <h3>🏛️ {t.capCityBudget}</h3>
            <p>{t.capCityBudgetText}</p>
            <span>{t.capBudgetPending}</span>
          </div>

          <div className="budget-card">
            <h3>🌱 {t.capCAPComponents}</h3>
            <p>{t.capCAPComponentsText}</p>
            <span>{t.capCAPBudgetPending}</span>
          </div>
        </div>
      </section>

    </div>
  );
}