import { useRemote } from '../../../shared/useRemote';
import { localText } from '../../../shared/api';
import L from 'leaflet';
import markerUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import "./ClimateMap.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline
} from "react-leaflet";

import { useState } from "react";


import pedestrianStreets from "../data/pedestrian-streets";
import floodRiskAreas from "../data/flood-risk";
import heatRiskAreas from "../data/heat-risk";
import greenSpaces from "../data/green-spaces";
import pcmcGIS from "../data/pcmc-gis";
import wasteFacilities from "../data/waste-facilities";
import stpLocations from "../data/stp-locations";
import climateProjects from "../data/climate-projects";
import { translations } from "../data/translations";
import mobilityStations from "../data/mobility";

L.Marker.prototype.options.icon=L.icon({iconUrl:markerUrl,shadowUrl,iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41]});
function validPoint(point){return Array.isArray(point)&&point.length===2&&point.every(value=>typeof value==='number'&&Number.isFinite(value))&&Math.abs(point[0])<=90&&Math.abs(point[1])<=180;}
const floodAreas=floodRiskAreas.map(area=>typeof area==='string'?{name:area}:area);
const heatAreas=heatRiskAreas.map(area=>typeof area==='string'?{name:area}:area);
export default function ClimateMap({ language }) {
  const t = translations[language];
  const remote=useRemote("publications/?kind=map");

  const [layers, setLayers] = useState({
    flooding: false,
    greenSpaces: false,
    municipalBuildings: false,
    pedestrianStreets: false,
    floodRisk: false,
    heatRisk: false,
    water: false,
    waste: false,
    mobility: false,
    projects: false
  });

  function toggleLayer(layer) {
    setLayers({
      ...layers,
      [layer]: !layers[layer]
    });
  }

  return (
    <div className="climate-map-page">

      <section className="map-header">
        <h1>{t.climateMapTitle}</h1>

        <p>{t.climateMapDescription}</p>
      </section>

      <section className="map-container">

        <div className="map-controls">

          <h3>{t.mapLayers}</h3>

          <label>
            <input type="checkbox" checked={layers.heatRisk} onChange={() => toggleLayer("heatRisk")} />
            {t.layerHeatRisk}
          </label>

          <label>
            <input
              type="checkbox"
              checked={layers.floodRisk}
              onChange={() => toggleLayer("floodRisk")}
            />
            {t.layerFlooding}
          </label>


          <label>
            <input
              type="checkbox"
              checked={layers.greenSpaces}
              onChange={() => toggleLayer("greenSpaces")}
            />
            {t.layerGreenSpaces}
          </label>

          <label>
            <input
              type="checkbox"
              checked={layers.municipalBuildings}
              onChange={() => toggleLayer("municipalBuildings")}
            />
            {t.layerMunicipalBuildings}
          </label>

          <label>
            <input
              type="checkbox"
              checked={layers.pedestrianStreets}
              onChange={() => toggleLayer("pedestrianStreets")}
            />
            {t.layerPedestrianStreets}
          </label>

          <label>
            <input
              type="checkbox"
              checked={layers.floodRisk}
              onChange={() => toggleLayer("floodRisk")}
            />
            {t.layerFloodRisk}
          </label>


          <label>
            <input
              type="checkbox"
              checked={layers.water}
              onChange={() => toggleLayer("water")}
            />
            {t.layerWater}
          </label>

          <label>
            <input
              type="checkbox"
              checked={layers.waste}
              onChange={() => toggleLayer("waste")}
            />
            {t.layerWaste}
          </label>

          <label>
            <input
              type="checkbox"
              checked={layers.mobility}
              onChange={() => toggleLayer("mobility")}
            />
            {t.layerMobility}
          </label>

          <label>
            <input
              type="checkbox"
              checked={layers.projects}
              onChange={() => toggleLayer("projects")}
            />
            {t.layerProjects}
          </label>

        </div>

        <MapContainer
          center={[18.6298, 73.7997]}
          zoom={12}
          scrollWheelZoom={true}
          className="climate-map"
        >

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {remote.data.filter(row=>layers[row.data.layer]).map(row=>{
            const popup=<Popup><strong>{row.title}</strong><p>{localText(row.data,'description',language)}</p><small>{row.data.source}</small></Popup>;
            if(row.data.geometry==='line'){try{const coordinates=JSON.parse(row.data.coordinates);return Array.isArray(coordinates)&&coordinates.length>=2&&coordinates.every(validPoint)?<Polyline key={`live-${row.id}`} positions={coordinates}>{popup}</Polyline>:null;}catch{return null;}}
            if(row.data.latitude==null||row.data.longitude==null)return null;
            const position=[Number(row.data.latitude),Number(row.data.longitude)];return validPoint(position)?<Marker key={`live-${row.id}`} alt={row.title} position={position}>{popup}</Marker>:null;
          })}
          {/* MOBILITY — must be inside MapContainer */}
            {layers.mobility &&
            mobilityStations.map((station) => (
            <Marker
              key={station.id}
              position={station.position}
            >
            <Popup>
              <strong>{station.name}</strong>
              <br />
              {station.category}
              </Popup>
            </Marker>
            ))}
            
          {/* FLOOD RISK AREAS */}

          {layers.floodRisk &&
            floodAreas.filter(area=>validPoint(area.coordinates)).map((area) => (

              <Marker
                key={area.name}
                position={area.coordinates}
              >

              <Popup>
                <strong> {area.name}</strong>

                <br />

                Flood Risk / Waterlogging Area

                <br />

                Coordinates: {area.coordinates[0]}, {area.coordinates[1]}
              </Popup>

            </Marker>

          ))}
          {layers.heatRisk && heatAreas.filter(area=>validPoint(area.coordinates)).map(area=>(
            <Marker key={area.name} position={area.coordinates}>
              <Popup><strong>{area.name}</strong><br />{t.layerHeatRisk}<br />Coordinates: {area.coordinates[0]}, {area.coordinates[1]}</Popup>
            </Marker>
          ))}
          {/* WASTE INFRASTRUCTURE */}

          {layers.waste &&
            wasteFacilities.map((site) => (
              <Marker
                key={site.siteName}
                position={site.coordinates}
              >
                <Popup>

                  <strong> {site.siteName}</strong>

                  <br /><br />

                  <strong>Facilities:</strong>

                  {site.facilities.map((facility) => (
                    <div key={facility.name}>
                      <br />
                      <strong>{facility.name}</strong>
                      <br />
                      Type: {facility.type}
                      <br />
                      Capacity: {facility.capacityTPD} TPD
                    </div>
                  ))}

                  <br />

                  <small>
                    Location: {site.location}
                  </small>

                </Popup>
              </Marker>
            ))
          }

          {/* WATER INFRASTRUCTURE / STPs */}

          {layers.water &&
            stpLocations.map((stp) => (
            <Marker
              key={stp.name}
              position={stp.coordinates}
            >
              <Popup>
                <strong> {stp.name}</strong>

                <br />

                Sewage Treatment Plant

                <br />

                Capacity: {stp.capacity} MLD
              </Popup>
            </Marker>
            ))
            }
        
          {/* PCMC CLIMATE PROJECTS */}

          {layers.projects &&
            climateProjects.map((project) => (
              <Marker
                key={project.name}
                position={project.coordinates}
              >
                <Popup>
                  <strong> {project.name}</strong>

                  <br /><br />

                  PCMC Climate Action Project

                  <br />

                  {project.description && (
                    <>
                      <br />
                      {project.description}
                    </>
                  )}
                </Popup>
              </Marker>
            ))
          }

          {/* GREEN SPACES */}

          {layers.greenSpaces &&
            greenSpaces.map((place) => (

              <Marker
                key={place.id}
                position={place.position}
              >

                <Popup>

                  <strong>{place.name}</strong>

                  <br />

                  {t.type}: {place.type}

                  <br />

                  {t.pcmc}

                </Popup>

              </Marker>

            ))}

          {/* REAL PCMC GIS FEATURES */}

          {layers.municipalBuildings &&
            pcmcGIS.map((place) => (

              <Marker
                key={place.featId}
                position={place.position}
              >

                <Popup>

                  <strong>{place.name}</strong>

                  <br />

                  {place.address}

                  <br />

                  {place.description}

                  <br />

                  <small>
                    {t.pcmcGisFeatureId}: {place.featId}
                  </small>

                </Popup>

              </Marker>

            ))}

          {/* PEDESTRIAN STREETS */}

          {layers.pedestrianStreets &&
            pedestrianStreets.map((street) => (

              <Polyline
                key={street.name}
                positions={street.coordinates}
              >

                <Popup>

                  <strong>{street.name}</strong>

                  <br />

                  {t.type}: {t.pedestrianFriendlyStreet}

                  <br />

                  {t.pcmc}

                </Popup>

              </Polyline>

            ))}
          


        </MapContainer>

      </section>

    </div>
  );
}