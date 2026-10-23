import "./SectorCard.css";
import { Link } from "react-router-dom";
import { translations } from "../../data/translations";

export default function SectorCard({ sector, language }) {
  const t = translations[language];

  const sectorTranslationKeys = {
    "rising-heat": "risingHeat",
    "flooding-water-logging": "flooding",
    "solid-waste-management": "solidWaste",
    "green-city-biodiversity": "greenCity",
    "sustainable-mobility": "sustainableMobility",
    "renewable-energy": "renewableEnergy",
    "water-security-conservation": "waterConservation",
    "clean-air-healthy-life": "cleanAir"
  };

  return (
    <div className="sector-card">
      <div className="sector-icon">
        {sector.icon}
      </div>

      <h3>{t[sectorTranslationKeys[sector.id]]}</h3>

      <p>
        {language === "mr"
          ? sector.currentScenarioMr
          : sector.currentScenario}
      </p>

      <Link to={`/sector/${sector.id}`}>
        {t.exploreSector}
      </Link>
    </div>
  );
}