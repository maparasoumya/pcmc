import { useServerCollection } from '../../../shared/useServerCollection';
import CollectionStatus from '../../../shared/CollectionStatus';

import { useMemo, useState } from "react";

const mapLayers = [
  {
    name: "Heat Risk",
    icon: "",
    description: "Document heat-affected areas and local observations.",
    color: "#FFF1DF",
  },
  {
    name: "Flooding / Water Logging",
    icon: "",
    description: "Record waterlogging locations and flood-prone areas.",
    color: "#E8F0FA",
  },
  {
    name: "Green Spaces",
    icon: "",
    description: "Manage parks, green cover, and open spaces.",
    color: "#E8F3E9",
  },
  {
    name: "Water Infrastructure",
    icon: "",
    description: "Record water infrastructure and related concerns.",
    color: "#E7F4F8",
  },
  {
    name: "Waste Infrastructure",
    icon: "",
    description: "Manage waste facilities and infrastructure records.",
    color: "#F0EDFA",
  },
  {
    name: "Mobility",
    icon: "",
    description: "Document mobility, transport, and accessibility.",
    color: "#FBEAE8",
  },
  {
    name: "PCMC Climate Projects",
    icon: "",
    description: "Track climate-related projects and their locations.",
    color: "#F3EFDF",
  },
];


const emptyForm = {
  title: "",
  location: "",
  description: "",
  status: "Pending Verification",
  latitude: "", longitude: "", geometry:"point", coordinates:"",
};

const statuses = ["Pending Verification", "Verified", "Needs Review"];
const layerNames = new Set(mapLayers.map((layer) => layer.name));


const C = {
  bg: "#F5F7F6",
  dark: "#394F49",
  fern: "#65743A",
  sage: "#E8EEE3",
  white: "#FFFFFF",
  border: "#DCE3DD",
  muted: "#75817B",
  greenBg: "#E8F3E9",
  greenText: "#2F7D4A",
  redBg: "#FDECEC",
  red: "#B42318",
};

const buttonBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "10px 15px",
  border: "1px solid transparent",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: 750,
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "background 150ms ease, border-color 150ms ease",
};

const inputBase = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 13px",
  border: `1px solid ${C.border}`,
  borderRadius: "9px",
  background: C.white,
  color: C.dark,
  fontSize: "16px",
  fontFamily: "inherit",
  outlineColor: C.fern,
};

function createId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}


function statusStyle(status) {
  if (status === "Verified") {
    return { background: C.greenBg, color: C.greenText };
  }

  if (status === "Needs Review") {
    return { background: C.redBg, color: C.red };
  }

  return { background: C.sage, color: C.fern };
}

function Card({ children, style = {} }) {
  return (
    <section
      style={{
        position: "relative",
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: "15px",
        padding: "clamp(17px, 2.5vw, 24px)",
        boxShadow: "0 4px 14px rgba(57,79,73,0.06)",
        minWidth: 0,
        ...style,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: C.fern,
          borderRadius: "15px 15px 0 0",
        }}
      />
      {children}
    </section>
  );
}

function Field({ label, children, hint }) {
  return (
    <label
      style={{
        display: "grid",
        gap: "8px",
        alignContent: "start",
        color: C.dark,
        fontSize: "15px",
        fontWeight: 700,
        minWidth: 0,
      }}
    >
      {label}
      {children}
      {hint && (
        <span
          style={{
            fontSize: "13px",
            color: C.muted,
            fontWeight: 400,
          }}
        >
          {hint}
        </span>
      )}
    </label>
  );
}

export default function MapData() {
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [records, setRecords, serverState] = useServerCollection("map");
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);



  const layerRecords = useMemo(
    () => records.filter((record) => record.layer === selectedLayer),
    [records, selectedLayer]
  );

  const visibleRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return layerRecords;

    return layerRecords.filter((record) =>
      [record.title, record.location, record.description, record.status].some(
        (value) => String(value || "").toLowerCase().includes(term)
      )
    );
  }, [layerRecords, search]);

  const verifiedCount = layerRecords.filter(
    (record) => record.status === "Verified"
  ).length;

  const attentionCount = layerRecords.filter(
    (record) => record.status !== "Verified"
  ).length;


  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setError("");
    setDeleteId(null);
  }

  function openLayer(layer) {
    setSelectedLayer(layer);
    resetForm();
    setSearch("");
    setMessage("");
  }

  function backToLayers() {
    setSelectedLayer(null);
    resetForm();
    setSearch("");
    setMessage("");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setMessage("");
  }

  async function handleSubmit(event) {
    try {

    event.preventDefault();

    const title = form.title.trim();
    const location = form.location.trim();
    const description = form.description.trim();

    if (!title || !location || !description) {
      setError("Please complete all required fields before saving.");
      return;
    }

    if (!selectedLayer || !layerNames.has(selectedLayer)) {
      setError("Please select a valid map layer first.");
      return;
    }

    const duplicate = records.some(
      (record) =>
        record.layer === selectedLayer &&
        record.title.trim().toLowerCase() === title.toLowerCase() &&
        record.id !== editingId
    );

    if (duplicate) {
      setError("A record with this title already exists in this layer.");
      return;
    }

    const now = new Date().toISOString();

    if (editingId) {
      await setRecords((current) =>
        current.map((record) =>
          record.id === editingId
            ? {
                ...record,
                title,
                latitude:form.latitude,longitude:form.longitude,geometry:form.geometry,coordinates:form.coordinates,
                location,
                description,
                status: form.status,
                updatedAt: now,
              }
            : record
        )
      );

      setMessage("Changes saved to the server.");
    } else {
      await setRecords((current) => [
        ...current,
        {
          id: createId(),
          layer: selectedLayer,
          latitude:form.latitude,longitude:form.longitude,geometry:form.geometry,coordinates:form.coordinates,
          title,
          location,
          description,
          status: form.status,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      setMessage("Record added successfully.");
    }

    resetForm();
  
    } catch (error) { setError(error.message); }
  }

  function editRecord(record) {
    setEditingId(record.id);

    setForm({
      latitude:record.latitude??"",longitude:record.longitude??"",geometry:record.geometry||"point",coordinates:record.coordinates||"",
      title: record.title,
      location: record.location,
      description: record.description,
      status: record.status,
    });

    setError("");
    setMessage("");
    setDeleteId(null);

    document.getElementById("map-record-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function removeRecord(id) {
    try {

    await setRecords((current) => current.filter((record) => record.id !== id));

    if (editingId === id) {
      resetForm();
    }

    setDeleteId(null);
    setMessage("Record deleted.");
    setError("");
  
    } catch (error) { setError(error.message); }
  }

  function primaryEnter(event) {
    event.currentTarget.style.background = "#2F7D4A";
    event.currentTarget.style.borderColor = "#2F7D4A";
  }

  function primaryLeave(event) {
    event.currentTarget.style.background = C.dark;
    event.currentTarget.style.borderColor = C.dark;
  }

  return (
    <div
      style={{
        minHeight: "100%",
        background: C.bg,
        padding: "8px 4px 32px",
        boxSizing: "border-box",
      }}
    >
      <CollectionStatus state={serverState}/>

      <div style={{ maxWidth: "1380px", margin: "0 auto" }}>
        <header style={{ marginBottom: "30px" }}>
          <div
            style={{
              display: "inline-block",
              padding: "7px 13px",
              borderRadius: "20px",
              background: C.greenBg,
              color: C.greenText,
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "0.6px",
              marginBottom: "15px",
            }}
          >
            CLIMATE MAP DATA
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              color: C.dark,
              fontSize: "38px",
              lineHeight: 1.2,
              fontWeight: 750,
              letterSpacing: "-0.5px",
            }}
          >
            Map Data
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "720px",
              color: C.fern,
              fontSize: "17px",
              lineHeight: 1.7,
            }}
          >
            Select a climate layer to add, search, and manage its records.
          </p>
        </header>

        {!selectedLayer ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "18px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: "0 0 6px",
                    color: C.dark,
                    fontSize: "25px",
                  }}
                >
                  Choose a map layer
                </h2>
                <p style={{ margin: 0, color: C.muted, fontSize: "15px" }}>
                  Select a card to open its workspace.
                </p>
              </div>

              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "9px",
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  color: C.fern,
                  fontSize: "14px",
                  fontWeight: 750,
                }}
              >
                {records.length} total records
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
                gap: "17px",
              }}
            >
              {mapLayers.map((layer) => {
                const count = records.filter(
                  (record) => record.layer === layer.name
                ).length;

                return (
                  <button
                    key={layer.name}
                    type="button"
                    onClick={() => openLayer(layer.name)}
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      gap: "16px",
                      padding: "22px",
                      minHeight: "205px",
                      overflow: "hidden",
                      border: `1px solid ${C.border}`,
                      borderRadius: "15px",
                      background: C.white,
                      boxShadow: "0 4px 14px rgba(57,79,73,0.05)",
                      cursor: "pointer",
                      color: C.dark,
                      fontFamily: "inherit",
                      textAlign: "left",
                      transition: "transform 150ms ease, box-shadow 150ms ease",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.transform = "translateY(-3px)";
                      event.currentTarget.style.boxShadow =
                        "0 8px 20px rgba(57,79,73,0.12)";

                      const view = event.currentTarget.querySelector(
                        ".map-layer-view"
                      );

                      if (view) {
                        view.style.background = "#2F7D4A";
                        view.style.borderColor = "#2F7D4A";
                      }
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = "translateY(0)";
                      event.currentTarget.style.boxShadow =
                        "0 4px 14px rgba(57,79,73,0.05)";

                      const view = event.currentTarget.querySelector(
                        ".map-layer-view"
                      );

                      if (view) {
                        view.style.background = "#385149";
                        view.style.borderColor = "#385149";
                      }
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background: C.fern,
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      

                      <span
                        style={{
                          padding: "5px 9px",
                          borderRadius: "20px",
                          background: count ? C.greenBg : C.bg,
                          color: count ? C.greenText : C.muted,
                          fontSize: "13px",
                          fontWeight: 750,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {count} {count === 1 ? "record" : "records"}
                      </span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          margin: "0 0 7px",
                          fontSize: "19px",
                          lineHeight: 1.4,
                          fontWeight: 750,
                        }}
                      >
                        {layer.name}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: C.muted,
                          fontSize: "15px",
                          lineHeight: 1.65,
                        }}
                      >
                        {layer.description}
                      </p>
                    </div>

                    <div
                      className="map-layer-view"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        alignSelf: "flex-start",
                        gap: "8px",
                        padding: "10px 16px",
                        border: "1px solid #385149",
                        borderRadius: "8px",
                        background: "#385149",
                        color: "#FFFFFF",
                        fontSize: "16px",
                        fontWeight: 600,
                        transition: "all 0.2s ease",
                      }}
                    >
                      View
                      <span aria-hidden="true" style={{ fontSize: "20px" }}>
                        →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={backToLayers}
              style={{
                ...buttonBase,
                padding: "9px 0",
                marginBottom: "20px",
                background: "transparent",
                color: C.fern,
              }}
            >
              <span aria-hidden="true" style={{ fontSize: "20px" }}>
                ←
              </span>
              Back to all layers
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "23px",
              }}
            >
              

              <div style={{ flex: "1 1 240px" }}>
                <p
                  style={{
                    margin: "0 0 5px",
                    color: C.fern,
                    fontSize: "13px",
                    fontWeight: 800,
                    letterSpacing: "0.7px",
                  }}
                >
                  LAYER WORKSPACE
                </p>
                <h2
                  style={{
                    margin: 0,
                    color: C.dark,
                    fontSize: "clamp(23px, 3vw, 30px)",
                    lineHeight: 1.3,
                  }}
                >
                  {selectedLayer}
                </h2>
              </div>

              <span
                style={{
                  padding: "9px 12px",
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: "10px",
                  color: C.fern,
                  fontSize: "14px",
                  fontWeight: 750,
                }}
              >
                {layerRecords.length} saved
              </span>
            </div>

            {message && (
              <div
                role="status"
                style={{
                  padding: "12px 14px",
                  marginBottom: "18px",
                  borderRadius: "9px",
                  background: C.greenBg,
                  color: C.greenText,
                  fontSize: "15px",
                  lineHeight: 1.6,
                }}
              >
                {message}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 170px), 1fr))",
                gap: "12px",
                marginBottom: "22px",
              }}
            >
              {[
                { label: "Total Records", value: layerRecords.length },
                { label: "Verified", value: verifiedCount },
                { label: "Needs Attention", value: attentionCount },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    padding: "18px 20px",
                    border: `1px solid ${C.border}`,
                    borderRadius: "13px",
                    background: C.white,
                    boxShadow: "0 4px 14px rgba(57,79,73,0.04)",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 9px",
                      color: C.fern,
                      fontSize: "14px",
                    }}
                  >
                    {stat.label}
                  </p>
                  <strong style={{ color: C.dark, fontSize: "28px" }}>
                    {stat.value}
                  </strong>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 310px), 1fr))",
                gap: "20px",
                alignItems: "start",
              }}
            >
              <Card>
                <div id="map-record-form">
                  <p
                    style={{
                      margin: "0 0 7px",
                      color: C.fern,
                      fontSize: "13px",
                      fontWeight: 800,
                      letterSpacing: "0.6px",
                    }}
                  >
                    {editingId ? "UPDATE EXISTING ENTRY" : "NEW ENTRY"}
                  </p>

                  <h3
                    style={{
                      margin: "0 0 8px",
                      color: C.dark,
                      fontSize: "24px",
                    }}
                  >
                    {editingId ? "Edit record" : "Add information"}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 23px",
                      color: C.muted,
                      fontSize: "15px",
                      lineHeight: 1.65,
                    }}
                  >
                    Add a record for this layer. Fields marked with * are
                    required.
                  </p>

                  {error && (
                    <div
                      role="alert"
                      style={{
                        padding: "11px 12px",
                        marginBottom: "16px",
                        borderRadius: "9px",
                        background: C.redBg,
                        color: C.red,
                        fontSize: "14px",
                        lineHeight: 1.5,
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gap: "18px" }}>
                      <Field label="Record title *">
                        <input
                          name="title"
                          value={form.title}
                          onChange={handleChange}
                          placeholder="e.g. Waterlogging near main road"
                          maxLength={120}
                          required
                          style={inputBase}
                        />
                      </Field>

                      <Field label="Location *">
                        <input
                          name="location"
                          value={form.location}
                          onChange={handleChange}
                          placeholder="Area, road, ward, or landmark"
                          maxLength={180}
                          required
                          style={inputBase}
                        />
                      </Field>

                      <Field
                        label="Description *"
                        hint={`${form.description.length}/1200 characters`}
                      >
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          placeholder="Describe the issue or information..."
                          rows={5}
                          maxLength={1200}
                          required
                          style={{
                            ...inputBase,
                            resize: "vertical",
                            lineHeight: 1.6,
                          }}
                        />
                      </Field>

                      <Field label="Latitude"><input name="latitude" type="number" step="any" min="-90" max="90" value={form.latitude} onChange={handleChange} style={inputBase}/></Field>
                      <Field label="Longitude"><input name="longitude" type="number" step="any" min="-180" max="180" value={form.longitude} onChange={handleChange} style={inputBase}/></Field>
                      <Field label="Verification status">
                        <select
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          style={inputBase}
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                        marginTop: "23px",
                      }}
                    >
                      <button
                        type="submit"
                        style={{
                          ...buttonBase,
                          flex: "1 1 130px",
                          background: C.dark,
                          borderColor: C.dark,
                          color: C.white,
                        }}
                        onMouseEnter={primaryEnter}
                        onMouseLeave={primaryLeave}
                      >
                        {editingId ? "Save Changes" : "Add Record"} →
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setMessage("");
                        }}
                        style={{
                          ...buttonBase,
                          background: C.white,
                          borderColor: C.border,
                          color: C.dark,
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.background = C.sage;
                          event.currentTarget.style.borderColor = C.fern;
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background = C.white;
                          event.currentTarget.style.borderColor = C.border;
                        }}
                      >
                        {editingId ? "Cancel Edit" : "Clear Form"}
                      </button>
                    </div>
                  </form>
                </div>
              </Card>

              <Card>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginBottom: "18px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: "0 0 6px",
                        color: C.dark,
                        fontSize: "24px",
                      }}
                    >
                      Saved records
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: C.muted,
                        fontSize: "14px",
                        lineHeight: 1.6,
                      }}
                    >
                      Entries for this layer.
                    </p>
                  </div>

                  <span
                    style={{
                      background: C.sage,
                      color: C.fern,
                      borderRadius: "9px",
                      padding: "7px 10px",
                      fontSize: "13px",
                      fontWeight: 800,
                    }}
                  >
                    {visibleRecords.length} shown
                  </span>
                </div>

                <input
                  aria-label="Search saved records"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title, location, status..."
                  style={{ ...inputBase, marginBottom: "17px" }}
                />

                {visibleRecords.length === 0 ? (
                  <div
                    style={{
                      padding: "30px 16px",
                      border: `1px dashed ${C.border}`,
                      borderRadius: "12px",
                      background: C.bg,
                      textAlign: "center",
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{ fontSize: "30px", marginBottom: "11px" }}
                    >
                      {search ? "" : ""}
                    </div>

                    <strong
                      style={{
                        display: "block",
                        color: C.dark,
                        fontSize: "17px",
                        marginBottom: "7px",
                      }}
                    >
                      {search ? "No matching records" : "Nothing added yet"}
                    </strong>

                    <p
                      style={{
                        margin: 0,
                        color: C.muted,
                        fontSize: "14px",
                        lineHeight: 1.6,
                      }}
                    >
                      {search
                        ? "Try another search term."
                        : "Add your first record using the form."}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {visibleRecords.map((record) => (
                      <article
                        key={record.id}
                        style={{
                          padding: "16px",
                          border: `1px solid ${C.border}`,
                          borderRadius: "12px",
                          background: C.white,
                          minWidth: 0,
                          transition:
                            "transform 150ms ease, box-shadow 150ms ease",
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.transform = "translateY(-2px)";
                          event.currentTarget.style.boxShadow =
                            "0 6px 16px rgba(57,79,73,0.09)";
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.transform = "translateY(0)";
                          event.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <h4
                            style={{
                              margin: 0,
                              color: C.dark,
                              fontSize: "17px",
                              lineHeight: 1.5,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {record.title || "Untitled record"}
                          </h4>

                          <span
                            style={{
                              ...statusStyle(record.status),
                              padding: "5px 8px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: 800,
                            }}
                          >
                            {record.status}
                          </span>
                        </div>

                        <p
                          style={{
                            margin: "10px 0 8px",
                            color: C.fern,
                            fontSize: "14px",
                            lineHeight: 1.5,
                            overflowWrap: "anywhere",
                          }}
                        >
                          <strong>Location:</strong>{" "}
                          {record.location || "Not specified"}
                        </p>

                        <p
                          style={{
                            margin: 0,
                            color: C.muted,
                            fontSize: "14px",
                            lineHeight: 1.7,
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {record.description}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "8px",
                            borderTop: `1px solid ${C.border}`,
                            paddingTop: "12px",
                            marginTop: "14px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => editRecord(record)}
                            style={{
                              ...buttonBase,
                              flex: "1 1 70px",
                              padding: "9px 11px",
                              background: C.sage,
                              color: C.dark,
                            }}
                          >
                            Edit
                          </button>

                          {deleteId === record.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => removeRecord(record.id)}
                                style={{
                                  ...buttonBase,
                                  flex: "1 1 100px",
                                  padding: "9px 11px",
                                  background: C.red,
                                  color: C.white,
                                }}
                              >
                                Confirm Delete
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteId(null)}
                                style={{
                                  ...buttonBase,
                                  padding: "9px 11px",
                                  background: C.bg,
                                  color: C.dark,
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteId(record.id);
                                setMessage("");
                                setError("");
                              }}
                              style={{
                                ...buttonBase,
                                flex: "1 1 70px",
                                padding: "9px 11px",
                                background: C.redBg,
                                color: C.red,
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
