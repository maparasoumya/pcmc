import { useRemote } from '../../../shared/useRemote';
import { localText,safeUrl } from '../../../shared/api';
import "./Resources.css";
import { translations } from "../data/translations";

export default function Resources({ language }) {
  const t = translations[language];
  const resources=useRemote("publications/?kind=resources");
  const vendors=useRemote("vendors/");

  return (
    <div className="resources-page">

      <section className="resources-hero">

        <div className="resources-hero-shape"></div>

        <span className="resources-label">
          PCMC • CLIMATE RESOURCES
        </span>

        <h1>{t.resourcesTitle}</h1>

        <p>{t.resourcesDescription}</p>

      </section>

      <section className="resources-section">

        <div className="resources-heading">
          <span>01</span>
          <h2>{t.guidesManuals}</h2>
        </div>

        <div className="resources-grid">{resources.data.length?resources.data.map(row=><div className="resource-card waste-card" key={row.id}><h3>{row.title}</h3><p>{localText(row.data,'description',language)}</p>{safeUrl(row.data.url)&&<a href={safeUrl(row.data.url)} target="_blank" rel="noopener noreferrer">{language==='mr'?'दस्तऐवज उघडा':'Open document'} →</a>}</div>):<>

          <div className="resource-card waste-card">
            

            <h3>{t.resourceWaste}</h3>

            <p>{t.resourceWasteText}</p>

            <span>{t.resourcesToBeAdded}</span>
          </div>

          <div className="resource-card water-card">
            

            <h3>{t.resourceWater}</h3>

            <p>{t.resourceWaterText}</p>

            <span>{t.resourcesToBeAdded}</span>
          </div>

          <div className="resource-card energy-card">
            

            <h3>{t.resourceEnergy}</h3>

            <p>{t.resourceEnergyText}</p>

            <span>{t.resourcesToBeAdded}</span>
          </div>

          <div className="resource-card green-card">
            

            <h3>{t.resourceGreen}</h3>

            <p>{t.resourceGreenText}</p>

            <span>{t.resourcesToBeAdded}</span>
          </div>

        </>}</div>

      </section>

      <section className="schemes-section">

        <div className="resources-section-inner">

          <div className="resources-heading light-heading">
            <span>02</span>
            <h2>{t.schemesServices}</h2>
          </div>

          <div className="scheme-card">

            

            <div>
              <h3>{t.citizenServices}</h3>

              <p>{t.citizenServicesText}</p>

              <span>{t.informationToBeAdded}</span>
            </div>

          </div>

        </div>

      </section>

      <section className="resources-section best-practices-section">

        <div className="resources-heading">
          <span>03</span>
          <h2>{t.bestPractices}</h2>
        </div>

        <div className="resources-grid three-column">

          <div className="resource-card practice-card">
            

            <h3>{t.sustainableHomes}</h3>

            <p>{t.sustainableHomesText}</p>
          </div>

          <div className="resource-card practice-card">
            

            <h3>{t.sustainableMobility}</h3>

            <p>{t.sustainableMobilityText}</p>
          </div>

          <div className="resource-card practice-card">
            

            <h3>{t.communityAction}</h3>

            <p>{t.communityActionText}</p>
          </div>

        </div>

      </section>

      <section className="support-section">
        <div className="support-heading">
          <span>04</span>
          <h2>{t.organizationsSupport}</h2>
        </div>

        {vendors.data.filter(row=>row.is_active).map(row=><div className="support-content" key={row.id}><div className="support-text"><h3>{row.name}</h3><p>{row.address}</p><p><a href={`tel:${row.phone_number}`}>{row.phone_number}</a> · <a href={`mailto:${row.email}`}>{row.email}</a></p></div></div>)}
        <div className="support-content">
          

          <div className="support-text">
            <h3>{t.climateSupport}</h3>
            <p>{t.climateSupportText}</p>
            <span>{t.informationToBeAdded}</span>
          </div>
        </div>
      </section>

    </div>
  );
}