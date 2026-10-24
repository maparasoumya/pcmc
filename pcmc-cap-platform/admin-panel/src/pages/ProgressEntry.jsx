import { useServerCollection } from '../../../shared/useServerCollection';
import CollectionStatus from '../../../shared/CollectionStatus';

import { useState } from "react";
import mockContent from "../data/mockContent.json";

const sectors = Array.isArray(mockContent) ? mockContent : [];

const initialForm = {
  sectorId: "",
  goal: "",
  target: "",
  targetYear: "",
  currentValue: "",
  unit: "",
  status: "On Track",
  lastUpdated: new Date().toISOString().slice(0, 10),
  source: "",
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: "9px",
  marginBottom: "22px",
  padding: "12px 14px",
  boxSizing: "border-box",
  border: "1px solid #D2DCD4",
  borderRadius: "9px",
  background: "#FFFFFF",
  color: "#394F49",
  fontSize: "16px",
  lineHeight: "1.55",
  fontFamily: "inherit",
  outlineColor: "#2F7D4A",
};

const labelStyle = {
  display: "block",
  color: "#394F49",
  fontSize: "16px",
  fontWeight: "700",
};

const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "11px 19px",
  border: "1px solid #385149",
  borderRadius: "8px",
  background: "#385149",
  color: "#FFFFFF",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "750",
  fontFamily: "inherit",
  transition: "background 150ms ease, border-color 150ms ease",
};

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  background: "#FFFFFF",
  color: "#394F49",
  border: "1px solid #D2DCD4",
};

function getSectorTitle(sectorId) {
  return sectors.find((sector) => sector.id === sectorId)?.title || "Unknown sector";
}

function getStatusColor(status) {
  if (status === "Completed" || status === "On Track") {
    return { background: "#E8F3E9", color: "#2F7D4A" };
  }

  if (status === "Delayed" || status === "Needs Attention") {
    return { background: "#FFF4D9", color: "#8A6A1D" };
  }

  return { background: "#ECEFED", color: "#65716A" };
}

export default function ProgressEntry() {
  const [records, setRecords, serverState] = useServerCollection("progress");
  const [form, setForm] = useState({ ...initialForm });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSector, setFilterSector] = useState("All");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setMessage("");
  }

  function resetForm() {
    setForm({ ...initialForm });
    setEditingId(null);
    setMessage("");
  }

  async function saveRecord(event) {
    try {

    event.preventDefault();

    if (!form.sectorId || !form.goal.trim() || !form.target.trim()) {
      setMessage("Please select a sector and enter a goal and target.");
      return;
    }

    const recordData = {
      ...form,
      goal: form.goal.trim(),
      target: form.target.trim(),
      currentValue: form.currentValue.trim(),
      unit: form.unit.trim(),
      source: form.source.trim(),
    };

    if (editingId !== null) {
      await setRecords((previous) =>
        previous.map((record) =>
          record.id === editingId ? { ...record, ...recordData } : record
        )
      );
      setMessage("Progress record updated to the server.");
    } else {
      await setRecords((previous) => [
        {
          ...recordData,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        },
        ...previous,
      ]);
      setMessage("Progress record saved to the server.");
    }

    setForm({ ...initialForm });
    setEditingId(null);
  
    } catch (error) { setMessage(error.message); }
  }

  function editRecord(record) {
    setForm({
      sectorId: record.sectorId,
      goal: record.goal,
      target: record.target,
      targetYear: record.targetYear,
      currentValue: record.currentValue,
      unit: record.unit,
      status: record.status,
      lastUpdated: record.lastUpdated,
      source: record.source,
    });

    setEditingId(record.id);
    setMessage("");

    document.getElementById("progress-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function deleteRecord(id) {
    try {

    await setRecords((previous) => previous.filter((record) => record.id !== id));

    if (editingId === id) {
      resetForm();
    }

    setMessage("Progress record removed from the server.");
  
    } catch (error) { setMessage(error.message); }
  }

  function handlePrimaryEnter(event) {
    event.currentTarget.style.background = "#2F7D4A";
    event.currentTarget.style.borderColor = "#2F7D4A";
  }

  function handlePrimaryLeave(event) {
    event.currentTarget.style.background = "#385149";
    event.currentTarget.style.borderColor = "#385149";
  }

  const visibleRecords = records.filter((record) => {
    const matchesStatus =
      filterStatus === "All" || record.status === filterStatus;
    const matchesSector =
      filterSector === "All" || record.sectorId === filterSector;

    return matchesStatus && matchesSector;
  });

  const counts = {
    total: records.length,
    onTrack: records.filter((record) => record.status === "On Track").length,
    attention: records.filter((record) => record.status === "Needs Attention").length,
    completed: records.filter((record) => record.status === "Completed").length,
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#F5F7F6",
        padding: "8px 4px 32px",
        boxSizing: "border-box",
        color: "#394F49",
      }}
    >
      <CollectionStatus state={serverState}/>

      <div style={{ maxWidth: "1380px", margin: "0 auto" }}>
        <section style={{ marginBottom: "30px" }}>
          <div
            style={{
              display: "inline-block",
              padding: "7px 13px",
              borderRadius: "20px",
              background: "#E8F3E9",
              color: "#2F7D4A",
              fontSize: "13px",
              fontWeight: "800",
              letterSpacing: "0.6px",
              marginBottom: "15px",
            }}
          >
            PROGRESS & TARGETS
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              color: "#394F49",
              fontSize: "38px",
              lineHeight: "1.2",
              fontWeight: "750",
              letterSpacing: "-0.5px",
            }}
          >
            Progress & Targets
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "720px",
              color: "#65743A",
              fontSize: "17px",
              lineHeight: "1.7",
            }}
          >
            Track climate action goals, record current values, and review
            progress across sectors.
          </p>
        </section>

        <section
          aria-label="Progress summary"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
            gap: "16px",
            marginBottom: "30px",
          }}
        >
          {[
            { label: "Total Records", value: counts.total, icon: "" },
            { label: "On Track", value: counts.onTrack, icon: "" },
            { label: "Needs Attention", value: counts.attention, icon: "" },
            { label: "Completed", value: counts.completed, icon: "✓" },
          ].map((item) => (
            <article
              key={item.label}
              style={{
                padding: "20px",
                background: "#FFFFFF",
                border: "1px solid #DCE3DD",
                borderRadius: "14px",
                boxShadow: "0 4px 14px rgba(57,79,73,0.05)",
                transition: "transform 150ms ease, box-shadow 150ms ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = "translateY(-3px)";
                event.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(57,79,73,0.12)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "translateY(0)";
                event.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(57,79,73,0.05)";
              }}
            >
              
              <p style={{ margin: "0 0 6px", color: "#65743A", fontSize: "15px" }}>
                {item.label}
              </p>
              <strong style={{ fontSize: "28px", color: "#394F49" }}>
                {item.value}
              </strong>
            </article>
          ))}
        </section>

        <section
          id="progress-form"
          style={{
            background: "#FFFFFF",
            border: "1px solid #DCE3DD",
            borderRadius: "15px",
            boxShadow: "0 4px 14px rgba(57,79,73,0.06)",
            overflow: "hidden",
            marginBottom: "32px",
          }}
        >
          <div style={{ height: "5px", background: "#65743A" }} />

          <div
            style={{
              padding: "24px 28px",
              borderBottom: "1px solid #DCE3DD",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: "20px",
                background: "#E8EEE3",
                color: "#65743A",
                fontSize: "12px",
                fontWeight: "800",
                letterSpacing: "0.5px",
              }}
            >
              {editingId !== null ? "EDIT RECORD" : "NEW RECORD"}
            </span>

            <h2
              style={{
                margin: "12px 0 7px",
                color: "#394F49",
                fontSize: "25px",
              }}
            >
              {editingId !== null ? "Edit Progress Record" : "Add Progress Entry"}
            </h2>

            <p style={{ margin: 0, color: "#65743A", fontSize: "16px", lineHeight: "1.7" }}>
              Enter goal and target information. You can revise entries before
              integrating the approved data source.
            </p>
          </div>

          <form onSubmit={saveRecord} style={{ padding: "28px" }}>
            <label style={labelStyle}>
              Sector
              <select
                name="sectorId"
                value={form.sectorId}
                onChange={updateField}
                required
                style={inputStyle}
              >
                <option value="">Select a sector</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.title}
                  </option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              Goal
              <textarea
                name="goal"
                value={form.goal}
                onChange={updateField}
                rows={4}
                required
                placeholder="Describe the climate action goal"
                style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }}
              />
            </label>

            <label style={labelStyle}>
              Target
              <input
                name="target"
                value={form.target}
                onChange={updateField}
                required
                placeholder="Enter the target value or outcome"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Target Year
              <input
                name="targetYear"
                type="number"
                min="1900"
                max="2200"
                value={form.targetYear}
                onChange={updateField}
                placeholder="e.g. 2030"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Current Value
              <input
                name="currentValue"
                value={form.currentValue}
                onChange={updateField}
                placeholder="Enter the current value"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Unit
              <input
                name="unit"
                value={form.unit}
                onChange={updateField}
                placeholder="e.g. %, MLD, tonnes/day"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Status
              <select
                name="status"
                value={form.status}
                onChange={updateField}
                style={inputStyle}
              >
                <option value="On Track">On Track</option>
                <option value="Needs Attention">Needs Attention</option>
                <option value="Delayed">Delayed</option>
                <option value="Completed">Completed</option>
              </select>
            </label>

            <label style={labelStyle}>
              Last Updated
              <input
                type="date"
                name="lastUpdated"
                value={form.lastUpdated}
                onChange={updateField}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Source
              <input
                name="source"
                value={form.source}
                onChange={updateField}
                placeholder="Source or verification reference"
                style={inputStyle}
              />
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
                paddingTop: "22px",
                borderTop: "1px solid #DCE3DD",
              }}
            >
              <button
                type="submit"
                style={primaryButtonStyle}
                onMouseEnter={handlePrimaryEnter}
                onMouseLeave={handlePrimaryLeave}
              >
                {editingId !== null ? "Save Changes" : "Save Draft"} →
              </button>

              <button
                type="button"
                onClick={resetForm}
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
                {editingId !== null ? "Cancel Edit" : "Clear Form"}
              </button>
            </div>

            {message && (
              <p
                role="status"
                style={{
                  margin: "20px 0 0",
                  padding: "13px 15px",
                  border: "1px solid #CFE5D2",
                  borderRadius: "9px",
                  background: "#E8F3E9",
                  color: "#2F7D4A",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  fontWeight: "700",
                }}
              >
                {message}
              </p>
            )}
          </form>
        </section>

        <section>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2 style={{ margin: "0 0 8px", color: "#394F49", fontSize: "26px" }}>
                Progress Records
              </h2>
              <p style={{ margin: 0, color: "#65743A", fontSize: "16px", lineHeight: "1.6" }}>
                {records.length === 0
                  ? "Your saved frontend test records will appear here."
                  : `${records.length} progress record${records.length === 1 ? "" : "s"} in this session.`}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <select
                aria-label="Filter by sector"
                value={filterSector}
                onChange={(event) => setFilterSector(event.target.value)}
                style={{ ...inputStyle, width: "auto", minWidth: "170px", margin: 0 }}
              >
                <option value="All">All sectors</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.title}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by progress status"
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value)}
                style={{ ...inputStyle, width: "auto", minWidth: "165px", margin: 0 }}
              >
                <option value="All">All statuses</option>
                <option value="On Track">On Track</option>
                <option value="Needs Attention">Needs Attention</option>
                <option value="Delayed">Delayed</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {visibleRecords.length === 0 ? (
            <div
              style={{
                padding: "34px 25px",
                background: "#FFFFFF",
                border: "1px solid #DCE3DD",
                borderRadius: "15px",
                boxShadow: "0 4px 14px rgba(57,79,73,0.05)",
                textAlign: "center",
              }}
            >
              
              <h3 style={{ margin: "0 0 8px", color: "#394F49", fontSize: "21px" }}>
                {records.length === 0 ? "No progress records yet" : "No matching records"}
              </h3>
              <p style={{ maxWidth: "520px", margin: "0 auto", color: "#65743A", fontSize: "16px", lineHeight: "1.7" }}>
                {records.length === 0
                  ? "Use the form above to add a progress entry and test the available controls."
                  : "Try changing the sector or status filter."}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 290px), 1fr))",
                gap: "18px",
              }}
            >
              {visibleRecords.map((record) => (
                <article
                  key={record.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    padding: "22px",
                    background: "#FFFFFF",
                    border: "1px solid #DCE3DD",
                    borderRadius: "15px",
                    boxShadow: "0 4px 14px rgba(57,79,73,0.06)",
                    transition: "transform 150ms ease, box-shadow 150ms ease",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.transform = "translateY(-3px)";
                    event.currentTarget.style.boxShadow = "0 8px 20px rgba(57,79,73,0.12)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.transform = "translateY(0)";
                    event.currentTarget.style.boxShadow = "0 4px 14px rgba(57,79,73,0.06)";
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      height: "4px",
                      margin: "-22px -22px 20px",
                      background: "#65743A",
                      borderRadius: "15px 15px 0 0",
                    }}
                  />

                  <span
                    style={{
                      ...getStatusColor(record.status),
                      alignSelf: "flex-start",
                      padding: "6px 10px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "800",
                    }}
                  >
                    {record.status}
                  </span>

                  <h3 style={{ margin: "15px 0 8px", color: "#394F49", fontSize: "20px", lineHeight: "1.45" }}>
                    {record.goal}
                  </h3>

                  <p style={{ margin: "0 0 14px", color: "#65743A", fontSize: "15px", lineHeight: "1.6" }}>
                    <strong>Sector:</strong> {getSectorTitle(record.sectorId)}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: "10px",
                      marginBottom: "16px",
                    }}
                  >
                    {[
                      { label: "Target", value: record.target },
                      {
                        label: "Current Value",
                        value: record.currentValue
                          ? `${record.currentValue}${record.unit ? ` ${record.unit}` : ""}`
                          : "Not entered",
                      },
                      { label: "Target Year", value: record.targetYear || "Not set" },
                      { label: "Last Updated", value: record.lastUpdated || "Not set" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          minWidth: 0,
                          padding: "11px",
                          borderRadius: "9px",
                          background: "#F5F7F6",
                        }}
                      >
                        <p style={{ margin: "0 0 5px", color: "#65743A", fontSize: "13px" }}>
                          {item.label}
                        </p>
                        <strong style={{ color: "#394F49", fontSize: "15px", overflowWrap: "anywhere" }}>
                          {item.value}
                        </strong>
                      </div>
                    ))}
                  </div>

                  {record.source && (
                    <p style={{ margin: "0 0 16px", color: "#65743A", fontSize: "14px", lineHeight: "1.6", overflowWrap: "anywhere" }}>
                      <strong>Source:</strong> {record.source}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: "9px", flexWrap: "wrap", marginTop: "auto" }}>
                    <button
                      type="button"
                      onClick={() => editRecord(record)}
                      style={primaryButtonStyle}
                      onMouseEnter={handlePrimaryEnter}
                      onMouseLeave={handlePrimaryLeave}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteRecord(record.id)}
                      style={{
                        ...secondaryButtonStyle,
                        color: "#9A3D35",
                        borderColor: "#E5C9C5",
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background = "#FFF0EE";
                        event.currentTarget.style.borderColor = "#C76B61";
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background = "#FFFFFF";
                        event.currentTarget.style.borderColor = "#E5C9C5";
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
