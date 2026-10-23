import { uploadAsset } from '../../../shared/api';
import { useServerCollection } from '../../../shared/useServerCollection';
import CollectionStatus from '../../../shared/CollectionStatus';

import { useState } from "react";


const initialForm = {
  title: "",
  date: "",
  location: "",
  description: "",
  posterUrl: "",
  source: "",
  status: "Draft",
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: "9px",
  marginBottom: "22px",
  padding: "12px 13px",
  boxSizing: "border-box",
  border: "1px solid #DCE3DD",
  borderRadius: "9px",
  background: "#FFFFFF",
  color: "#394F49",
  fontSize: "14px",
  lineHeight: "1.5",
  outlineColor: "#385149",
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block",
  color: "#394F49",
  fontSize: "14px",
  fontWeight: "700",
};

const primaryButtonStyle = {
  padding: "10px 16px",
  border: "1px solid #385149",
  borderRadius: "8px",
  background: "#385149",
  color: "#FFFFFF",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  fontFamily: "inherit",
  transition: "all 0.2s ease",
};

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  background: "#FFFFFF",
  color: "#385149",
};

const cardStyle = {
  position: "relative",
  minWidth: 0,
  padding: "20px",
  background: "#FFFFFF",
  border: "1px solid #DCE3DD",
  borderRadius: "14px",
  boxShadow: "0 4px 14px rgba(57, 79, 73, 0.05)",
  overflow: "hidden",
  boxSizing: "border-box",
};

const topBorderStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "5px",
  background: "#65743A",
};



function getStatusStyle(status) {
  if (status === "Published") {
    return {
      background: "#E8F3E9",
      color: "#2F7D4A",
    };
  }

  if (status === "Archived") {
    return {
      background: "#ECEFED",
      color: "#65716A",
    };
  }

  return {
    background: "#FFF4D9",
    color: "#8A6A1D",
  };
}

export default function Initiatives() {
  const [events, setEvents, serverState] = useServerCollection("initiatives");
  const [form, setForm] = useState({ ...initialForm });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");



  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  }

  function resetForm() {
    setForm({ ...initialForm });
    setEditingId(null);
    setMessage("");
  }

  async function saveEvent(event) {
    try {

    event.preventDefault();

    if (!form.title.trim()) {
      setMessage("Please enter an event title.");
      return;
    }

    if (!form.date) {
      setMessage("Please select an event date.");
      return;
    }

    const eventData = {
      ...form,
      title: form.title.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      posterUrl: form.posterUrl.trim(),
      source: form.source.trim(),
    };

    if (editingId !== null) {
      await setEvents((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? { ...item, ...eventData }
            : item
        )
      );

      setMessage("Event updated successfully.");
    } else {
      await setEvents((previous) => [
        {
          ...eventData,
          id: `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
        },
        ...previous,
      ]);

      setMessage("Event saved successfully.");
    }

    setForm({ ...initialForm });
    setEditingId(null);
  
    } catch (error) { setMessage(error.message); }
  }

  function editEvent(item) {
    setForm({
      title: item.title || "",
      date: item.date || "",
      location: item.location || "",
      description: item.description || "",
      posterUrl: item.posterUrl || "",
      source: item.source || "",
      status: item.status || "Draft",
    });

    setEditingId(item.id);
    setMessage("");

    document.getElementById("event-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function deleteEvent(id) {
    try {

    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    await setEvents((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (editingId === id) {
      setForm({ ...initialForm });
      setEditingId(null);
    }

    setMessage("Event deleted.");
  
    } catch (error) { setMessage(error.message); }
  }

  function primaryEnter(event) {
    event.currentTarget.style.background = "#2F7D4A";
    event.currentTarget.style.borderColor = "#2F7D4A";
  }

  function primaryLeave(event) {
    event.currentTarget.style.background = "#385149";
    event.currentTarget.style.borderColor = "#385149";
  }

  const counts = {
    total: events.length,
    published: events.filter(
      (item) => item.status === "Published"
    ).length,
    drafts: events.filter(
      (item) => item.status === "Draft"
    ).length,
    archived: events.filter(
      (item) => item.status === "Archived"
    ).length,
  };

  const statCards = [
    {
      label: "Total Events",
      value: counts.total,
      icon: "📅",
    },
    {
      label: "Published",
      value: counts.published,
      icon: "🌿",
    },
    {
      label: "Drafts",
      value: counts.drafts,
      icon: "📝",
    },
    {
      label: "Archived",
      value: counts.archived,
      icon: "✓",
    },
  ];

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
        {/* Page heading */}
        <section style={{ marginBottom: "30px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "7px 13px",
              borderRadius: "20px",
              background: "#E8F3E9",
              color: "#2F7D4A",
              fontSize: "11px",
              fontWeight: "800",
              letterSpacing: "0.6px",
              marginBottom: "15px",
            }}
          >
            CLIMATE EVENTS
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              color: "#394F49",
              fontSize: "36px",
              lineHeight: "1.2",
              fontWeight: "750",
              letterSpacing: "-0.5px",
            }}
          >
            Events &amp; Meetings
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "720px",
              color: "#65743A",
              fontSize: "15px",
              lineHeight: "1.7",
            }}
          >
            Manage climate-related events and meetings.
          </p>
        </section>

        {/* Summary cards */}
        <section
          aria-label="Event summary"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
            gap: "16px",
            marginBottom: "30px",
          }}
        >
          {statCards.map((item) => (
            <article
              key={item.label}
              style={{
                ...cardStyle,
                transition:
                  "transform 180ms ease, box-shadow 180ms ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform =
                  "translateY(-3px)";
                event.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(57,79,73,0.12)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "translateY(0)";
                event.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(57,79,73,0.05)";
              }}
            >
              <div
                style={{
                  fontSize: "22px",
                  marginBottom: "12px",
                  lineHeight: "1",
                }}
              >
                {item.icon}
              </div>

              <p
                style={{
                  margin: "0 0 12px",
                  color: "#65743A",
                  fontSize: "13px",
                  fontWeight: "400",
                }}
              >
                {item.label}
              </p>

              <div
                style={{
                  color: "#394F49",
                  fontSize: "27px",
                  lineHeight: "1.2",
                  fontWeight: "400",
                }}
              >
                {item.value}
              </div>
            </article>
          ))}
        </section>

        {/* Add or edit event */}
        <section
          id="event-form"
          style={{
            ...cardStyle,
            padding: 0,
            marginBottom: "34px",
          }}
        >
          <div style={topBorderStyle} />

          <div
            style={{
              padding: "24px 28px",
              borderBottom: "1px solid #DCE3DD",
            }}
          >
            <h2
              style={{
                margin: "0 0 7px",
                color: "#394F49",
                fontSize: "24px",
                lineHeight: "1.3",
                fontWeight: "750",
              }}
            >
              {editingId !== null ? "Edit Event" : "Add Event"}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#65743A",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              Add and manage climate-related events and meetings.
            </p>
          </div>

          <form onSubmit={saveEvent} style={{ padding: "28px" }}>
            <label style={labelStyle}>
              Initiative Title *
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={updateField}
                required
                placeholder="Enter event title..."
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Date *
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={updateField}
                required
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Location
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={updateField}
                placeholder="Enter event location..."
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                rows={5}
                placeholder="Enter event description..."
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />
            </label>

            <label style={labelStyle}>
              Poster Image URL (optional)
              <input
                type="url"
                name="posterUrl"
                value={form.posterUrl}
                onChange={updateField}
                placeholder="Enter poster image URL..."
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>Upload poster<input type="file" accept=".jpg,.jpeg,.png,.webp" style={inputStyle} onChange={async event=>{const file=event.target.files[0];if(!file)return;try{setMessage('Uploading…');const asset=await uploadAsset(file);setForm(current=>({...current,posterUrl:asset.file}));setMessage('Upload complete. Save to publish.');}catch(error){setMessage(error.message);}}}/></label>
            <label style={labelStyle}>
              Verified Source
              <input
                type="text"
                name="source"
                value={form.source}
                onChange={updateField}
                placeholder="Enter verified source..."
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
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </label>

            {message && (
              <p
                role="status"
                style={{
                  margin: "0 0 18px",
                  padding: "12px 14px",
                  border: "1px solid #D9E7D8",
                  borderRadius: "9px",
                  background: "#E8F3E9",
                  color: "#2F7D4A",
                  fontSize: "13px",
                  lineHeight: "1.6",
                }}
              >
                {message}
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                borderTop: "1px solid #DCE3DD",
                paddingTop: "20px",
              }}
            >
              <button
                type="submit"
                style={primaryButtonStyle}
                onMouseEnter={primaryEnter}
                onMouseLeave={primaryLeave}
              >
                {editingId !== null ? "Update Event" : "Save Event"} →
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={secondaryButtonStyle}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Event records */}
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "4px",
                height: "24px",
                borderRadius: "4px",
                background: "#65743A",
              }}
            />

            <h2
              style={{
                margin: 0,
                color: "#394F49",
                fontSize: "24px",
                lineHeight: "1.3",
                fontWeight: "750",
              }}
            >
              Events
            </h2>

            <span
              style={{
                padding: "5px 10px",
                borderRadius: "20px",
                background: "#E8EEE3",
                color: "#65743A",
                fontSize: "12px",
                fontWeight: "800",
              }}
            >
              {events.length} {events.length === 1 ? "event" : "events"}
            </span>
          </div>

          {events.length === 0 ? (
            <div style={{ ...cardStyle, padding: "28px 20px" }}>
              <div style={topBorderStyle} />

              <div
                style={{
                  width: "58px",
                  height: "58px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  borderRadius: "14px",
                  background: "#E8EEE3",
                  fontSize: "28px",
                }}
              >
                📅
              </div>

              <h3
                style={{
                  margin: "0 0 8px",
                  color: "#394F49",
                  fontSize: "20px",
                  fontWeight: "600",
                }}
              >
                No events yet
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#65743A",
                  fontSize: "14px",
                  lineHeight: "1.7",
                }}
              >
                Add your first event using the form above.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                gap: "18px",
              }}
            >
              {events.map((item) => (
                <article
                  key={item.id}
                  style={{
                    ...cardStyle,
                    padding: 0,
                    transition:
                      "transform 150ms ease, box-shadow 150ms ease",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.transform =
                      "translateY(-3px)";
                    event.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(57,79,73,0.12)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.transform = "translateY(0)";
                    event.currentTarget.style.boxShadow =
                      "0 4px 14px rgba(57,79,73,0.05)";
                  }}
                >
                  <div style={topBorderStyle} />

                  {item.posterUrl && (
                    <img
                      src={item.posterUrl}
                      alt={`${item.title} poster`}
                      style={{
                        display: "block",
                        width: "100%",
                        maxHeight: "220px",
                        objectFit: "cover",
                        marginTop: "5px",
                      }}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  <div style={{ padding: "24px 20px 20px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginBottom: "14px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "6px 10px",
                          borderRadius: "20px",
                          background: "#E8EEE3",
                          color: "#65743A",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        📅 {item.date}
                      </span>

                      <span
                        style={{
                          ...getStatusStyle(item.status),
                          display: "inline-flex",
                          padding: "5px 9px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3
                      style={{
                        margin: "0 0 10px",
                        color: "#394F49",
                        fontSize: "19px",
                        lineHeight: "1.4",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.title}
                    </h3>

                    {item.location && (
                      <p
                        style={{
                          margin: "0 0 12px",
                          color: "#65743A",
                          fontSize: "13px",
                          lineHeight: "1.6",
                          overflowWrap: "anywhere",
                        }}
                      >
                        <strong style={{ color: "#394F49" }}>
                          Location:{" "}
                        </strong>
                        {item.location}
                      </p>
                    )}

                    <p
                      style={{
                        margin: "0 0 15px",
                        color: "#65743A",
                        fontSize: "14px",
                        lineHeight: "1.7",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.description || "No description provided."}
                    </p>

                    {item.source && (
                      <p
                        style={{
                          margin: "0 0 18px",
                          color: "#65743A",
                          fontSize: "13px",
                          lineHeight: "1.6",
                          overflowWrap: "anywhere",
                        }}
                      >
                        <strong style={{ color: "#394F49" }}>
                          Source:{" "}
                        </strong>
                        {item.source}
                      </p>
                    )}

                    <div
                      style={{
                        display: "flex",
                        gap: "9px",
                        flexWrap: "wrap",
                        borderTop: "1px solid #DCE3DD",
                        paddingTop: "16px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => editEvent(item)}
                        style={primaryButtonStyle}
                        onMouseEnter={primaryEnter}
                        onMouseLeave={primaryLeave}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteEvent(item.id)}
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
