import { useRemote } from '../../../shared/useRemote';
import { request } from '../../../shared/api';

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import mockContent from "../data/mockContent.json";

const sectorIcons = {
  "rising-heat": "☀️",
  "flooding-water-logging": "🌧️",
  "solid-waste-management": "♻️",
  "green-city-biodiversity": "🌳",
  "sustainable-mobility": "🚲",
  "renewable-energy": "⚡",
  "water-security-conservation": "💧",
  "clean-air-healthy-life": "🌿",
};

function toDisplayText(value) {
  if (Array.isArray(value)) return value.join("\n");
  return typeof value === "string" ? value : "";
}

function getSectorFormData(sector) {
  return {
    title: sector.title || "",
    currentScenario: toDisplayText(sector.currentScenario),
    whyItMatters: toDisplayText(sector.whyItMatters),
    relevantAreas: toDisplayText(sector.relevantAreas),
    plannedActions: toDisplayText(sector.plannedActions),
    citizenActions: toDisplayText(sector.citizenActions),
  };
}

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: "9px",
  padding: "12px 14px",
  boxSizing: "border-box",
  border: "1px solid #D2DCD4",
  borderRadius: "9px",
  background: "#FFFFFF",
  color: "#394F49",
  fontSize: "14px",
  lineHeight: "1.55",
  fontFamily: "inherit",
  outlineColor: "#2F7D4A",
};

const labelStyle = {
  display: "block",
  marginBottom: "23px",
  color: "#394F49",
  fontSize: "14px",
  fontWeight: "700",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  minHeight: "120px",
};

const pageStyle = {
  minHeight: "100%",
  background: "#F5F7F6",
  padding: "8px 4px 32px",
  boxSizing: "border-box",
  color: "#394F49",
};

const formPanelStyle = {
  background: "#FFFFFF",
  border: "1px solid #DCE3DD",
  borderRadius: "15px",
  boxShadow: "0 4px 14px rgba(57, 79, 73, 0.06)",
  overflow: "hidden",
};

const badgeStyle = {
  display: "inline-block",
  padding: "7px 13px",
  borderRadius: "20px",
  background: "#E8F3E9",
  color: "#2F7D4A",
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "0.6px",
};

const backLinkStyle = {
  display: "inline-block",
  color: "#65743A",
  textDecoration: "none",
  fontSize: "13px",
  fontWeight: "700",
};

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "11px 19px",
  border: "1px solid #385149",
  borderRadius: "8px",
  background: "#385149",
  color: "#FFFFFF",
  cursor: "pointer",
  fontWeight: "750",
  fontSize: "13px",
  fontFamily: "inherit",
  transition: "background 150ms ease, border-color 150ms ease",
};

const secondaryButtonStyle = {
  ...buttonStyle,
  background: "#FFFFFF",
  color: "#394F49",
  border: "1px solid #D2DCD4",
};

export default function SectorEdit() {
 const {sectorId}=useParams();
 const remote=useRemote('publications/?kind=sectors',true);
 const row=remote.data.find(item=>item.slug===sectorId);
 const fallback=mockContent.find(item=>String(item.id)===String(sectorId));
 const sector=row?{...fallback,...row.data,id:row.slug,title:row.title}:fallback;
 if(remote.loading)return <div style={pageStyle}><p role="status">Loading sector…</p></div>;
 if(remote.error)return <div style={pageStyle}><p role="alert">{remote.error}</p><button onClick={remote.reload}>Retry</button></div>;
 return <SectorEditForm key={sectorId} sector={sector} serverRow={row} sectorId={sectorId}/>;
}
function SectorEditForm({sector,serverRow,sectorId}) {
  const [formData, setFormData] = useState(() =>
    sector ? getSectorFormData(sector) : null
  );

  const [savedData, setSavedData] = useState(() =>
    sector ? getSectorFormData(sector) : null
  );

  const [saveMessage, setSaveMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  if (!sector || !formData || !savedData) {
    return (
      <div style={pageStyle}>
        <section
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            padding: "28px",
            background: "#FFFFFF",
            border: "1px solid #DCE3DD",
            borderRadius: "15px",
          }}
        >
          <span style={badgeStyle}>NOT FOUND</span>
          <h1
            style={{
              margin: "15px 0 10px",
              fontSize: "30px",
              color: "#394F49",
            }}
          >
            Sector Not Found
          </h1>
          <p style={{ color: "#65743A", lineHeight: "1.7" }}>
            This sector could not be found in the current local catalogue.
          </p>
          <Link to="/sectors" style={backLinkStyle}>
            ← Back to Sectors
          </Link>
        </section>
      </div>
    );
  }

  const fields = [
    {
      name: "currentScenario",
      label: "Current Scenario",
      rows: 5,
    },
    {
      name: "whyItMatters",
      label: "Why It Matters",
      rows: 5,
    },
    {
      name: "relevantAreas",
      label: "Relevant Areas",
      rows: 4,
    },
    {
      name: "plannedActions",
      label: "Planned Actions",
      rows: 5,
    },
    {
      name: "citizenActions",
      label: "Citizen Actions",
      rows: 5,
    },
  ];

  function handleFieldChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaveMessage("");
  }

  async function handleSave(event) {
    event.preventDefault();setSaveMessage("");
    try {
      await request(`publications/${serverRow?`${serverRow.id}/`:''}`,{method:serverRow?'PATCH':'POST',authenticated:true,body:{kind:'sectors',slug:sectorId,title:formData.title,status:'published',data:{...serverRow?.data,...formData}}});
      setSavedData({...formData});setSaveMessage("Changes saved successfully.");setMessageType("success");
    } catch(error){setSaveMessage(error.message);setMessageType("error");}
  }

  function handleReset() {
    setFormData({ ...savedData });
    setSaveMessage("Form restored to the last saved values.");
    setMessageType("success");
  }

  function handleMouseEnter(event) {
    event.currentTarget.style.background = "#2F7D4A";
    event.currentTarget.style.borderColor = "#2F7D4A";
  }

  function handleMouseLeave(event) {
    event.currentTarget.style.background = "#385149";
    event.currentTarget.style.borderColor = "#385149";
  }

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "22px" }}>
          <Link to="/sectors" style={backLinkStyle}>
            ← Back to Sectors
          </Link>
        </div>

        <section
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: "58px",
              height: "58px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "14px",
              background: "#E8EEE3",
              fontSize: "28px",
              flexShrink: 0,
            }}
          >
            {sectorIcons[sectorId] || "🌱"}
          </div>

          <div>
            <span style={badgeStyle}>CLIMATE SECTORS</span>
            <h1
              style={{
                margin: "12px 0 10px",
                color: "#394F49",
                fontSize: "36px",
                lineHeight: "1.2",
                fontWeight: "750",
                letterSpacing: "-0.5px",
              }}
            >
              Edit Sector
            </h1>
            <p
              style={{
                margin: 0,
                color: "#65743A",
                fontSize: "15px",
                lineHeight: "1.7",
              }}
            >
              Update the information for{" "}
              <strong>{formData.title || "Untitled sector"}</strong>.
            </p>
          </div>
        </section>

        <section style={formPanelStyle}>
          <div style={{ height: "5px", background: "#65743A" }} />

          <div
            style={{
              padding: "24px 28px",
              borderBottom: "1px solid #E1E7E2",
            }}
          >
            <span
              style={{
                ...badgeStyle,
                background: "#E8EEE3",
                color: "#65743A",
              }}
            >
              SECTOR DETAILS
            </span>

            <h2
              style={{
                margin: "12px 0 8px",
                color: "#394F49",
                fontSize: "23px",
                lineHeight: "1.4",
              }}
            >
              Sector Information
            </h2>

            <p
              style={{
                margin: 0,
                color: "#65743A",
                fontSize: "14px",
                lineHeight: "1.7",
              }}
            >
              Edit the fields below and save your changes to test the form.
            </p>
          </div>

          <form onSubmit={handleSave} style={{ padding: "28px" }}>
            <div
              style={{
                marginBottom: "26px",
                padding: "15px 17px",
                background: "#F5F7F6",
                border: "1px solid #DCE3DD",
                borderRadius: "10px",
                fontSize: "14px",
              }}
            >
              <p
                style={{
                  margin: "0 0 5px",
                  fontSize: "10px",
                  color: "#65743A",
                  fontWeight: "800",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Sector ID
              </p>
              <strong>{sectorId}</strong>
            </div>

            <label style={labelStyle}>
              Sector Title
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFieldChange}
                required
                style={inputStyle}
              />
            </label>

            {fields.map((field) => (
              <label key={field.name} style={labelStyle}>
                {field.label}
                <textarea
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleFieldChange}
                  rows={field.rows}
                  style={textareaStyle}
                />
              </label>
            ))}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "8px",
                paddingTop: "24px",
                borderTop: "1px solid #E1E7E2",
              }}
            >
              <button
                type="submit"
                style={buttonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={handleReset}
                style={secondaryButtonStyle}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = "#E8EEE3";
                  event.currentTarget.style.borderColor = "#65743A";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = "#FFFFFF";
                  event.currentTarget.style.borderColor = "#D2DCD4";
                }}
              >
                Reset Saved Values
              </button>

              <Link
                to="/sectors"
                style={{
                  ...backLinkStyle,
                  padding: "10px 5px",
                }}
              >
                Cancel
              </Link>
            </div>

            {saveMessage && (
              <p
                role="status"
                style={{
                  margin: "22px 0 0",
                  padding: "13px 15px",
                  border: "1px solid #CFE5D2",
                  borderRadius: "9px",
                  background:
                    messageType === "success" ? "#E8F3E9" : "#FFF8E7",
                  color:
                    messageType === "success" ? "#2F7D4A" : "#725D20",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  fontWeight: "700",
                }}
              >
                {saveMessage}
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
