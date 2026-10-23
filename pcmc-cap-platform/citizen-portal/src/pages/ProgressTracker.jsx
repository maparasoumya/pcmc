import { useRemote } from '../../../shared/useRemote';
import "./ProgressTracker.css";
import { translations } from "../data/translations";

export default function ProgressTracker({ language }) {
  const t = translations[language];
  const reports=useRemote('publications/?kind=progress');
  function values(id){return reports.data.find(row=>row.data.sectorId===id)?.data;}
  function label(id){const data=values(id);return data?`${data.currentValue||'—'} / ${data.target} ${data.unit||''}`:t.dataToBeUpdated;}
  function percent(id){const data=values(id);return data&&Number(data.target)>0?Math.max(0,Math.min(100,Number(data.currentValue)/Number(data.target)*100)):0;}


  return (
    <div className="progress-page">

      <section className="progress-hero">
        <h1>{t.progressTitle}</h1>

        <p>{t.progressDescription}</p>
      </section>

      <section className="progress-section">
        <h2>{t.overallProgress}</h2>

        <div className="overall-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>

          <span className="progress-label">{t.dataToBeUpdated}</span>

          <p>{t.verifiedProgressData}</p>
        </div>
      </section>

      <section className="progress-section">
        <h2>{t.progressByArea}</h2>

        <div className="progress-grid">

          <div className="progress-card">
            <h3>🔥 {t.risingHeat}</h3>

            <div className="progress-bar">
              <div className="progress-fill" style={{width:`${percent("rising-heat")}%`}}></div>
            </div>

            <span className="progress-label">{label("rising-heat")}</span>
          </div>

          <div className="progress-card">
            <h3>🌊 {t.flooding}</h3>

            <div className="progress-bar">
              <div className="progress-fill" style={{width:`${percent("flooding-water-logging")}%`}}></div>
            </div>

            <span className="progress-label">{label("flooding-water-logging")}</span>
          </div>

          <div className="progress-card">
            <h3>♻️ {t.solidWaste}</h3>

            <div className="progress-bar">
              <div className="progress-fill" style={{width:`${percent("solid-waste-management")}%`}}></div>
            </div>

            <span className="progress-label">{label("solid-waste-management")}</span>
          </div>

          <div className="progress-card">
            <h3>🌳 {t.greenCity}</h3>

            <div className="progress-bar">
              <div className="progress-fill" style={{width:`${percent("green-city-biodiversity")}%`}}></div>
            </div>

            <span className="progress-label">{label("green-city-biodiversity")}</span>
          </div>

          <div className="progress-card">
            <h3>🚌 {t.sustainableMobility}</h3>

            <div className="progress-bar">
              <div className="progress-fill" style={{width:`${percent("sustainable-mobility")}%`}}></div>
            </div>

            <span className="progress-label">{label("sustainable-mobility")}</span>
          </div>

          <div className="progress-card">
            <h3>☀️ {t.renewableEnergy}</h3>

            <div className="progress-bar">
              <div className="progress-fill" style={{width:`${percent("renewable-energy")}%`}}></div>
            </div>

            <span className="progress-label">{label("renewable-energy")}</span>
          </div>

          <div className="progress-card">
            <h3>💧 {t.waterConservation}</h3>

            <div className="progress-bar">
              <div className="progress-fill" style={{width:`${percent("water-security-conservation")}%`}}></div>
            </div>

            <span className="progress-label">{label("water-security-conservation")}</span>
          </div>

          <div className="progress-card">
            <h3>🌫️ {t.cleanAir}</h3>

            <div className="progress-bar">
              <div className="progress-fill" style={{width:`${percent("clean-air-healthy-life")}%`}}></div>
            </div>

            <span className="progress-label">{label("clean-air-healthy-life")}</span>
          </div>

        </div>
      </section>

      <section className="progress-section">
        <h2>{t.progressStatus}</h2>

        <div className="status-list">
          <span>{t.completed}</span>
          <span>{t.ongoing}</span>
          <span>{t.planned}</span>
          <span>{t.dataToBeUpdated}</span>
        </div>
      </section>

    </div>
  );
}