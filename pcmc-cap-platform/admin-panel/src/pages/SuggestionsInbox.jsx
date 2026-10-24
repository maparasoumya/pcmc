import { useServerCollection } from '../../../shared/useServerCollection';
import CollectionStatus from '../../../shared/CollectionStatus';

import { useMemo, useState } from "react";


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
  amberBg: "#FFF1DF",
  amberText: "#946200",
  redBg: "#FDECEC",
  red: "#B42318",
};

const statuses = ["New", "Under Review", "Responded", "Archived"];



const buttonBase = {
  border: "none",
  borderRadius: "9px",
  padding: "10px 13px",
  fontSize: "14px",
  fontWeight: 750,
  fontFamily: "inherit",
  cursor: "pointer",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: `1px solid ${C.border}`,
  borderRadius: "9px",
  background: C.white,
  color: C.dark,
  fontSize: "15px",
  fontFamily: "inherit",
  outlineColor: C.fern,
};





function statusColors(status) {
  if (status === "Responded") {
    return { background: C.greenBg, color: C.greenText };
  }

  if (status === "Under Review") {
    return { background: C.amberBg, color: C.amberText };
  }

  if (status === "Archived") {
    return { background: "#ECEFF1", color: "#52616B" };
  }

  return { background: C.sage, color: C.fern };
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function Panel({ children, style = {} }) {
  return (
    <section
      style={{
        position: "relative",
        minWidth: 0,
        padding: "20px",
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: "14px",
        boxShadow: "0 4px 14px rgba(57,79,73,0.05)",
        boxSizing: "border-box",
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
          borderRadius: "14px 14px 0 0",
          background: C.fern,
        }}
      />
      {children}
    </section>
  );
}

function cardMouseEnter(event) {
  event.currentTarget.style.transform = "translateY(-3px)";
  event.currentTarget.style.boxShadow =
    "0 8px 20px rgba(57,79,73,0.12)";
}

function cardMouseLeave(event) {
  event.currentTarget.style.transform = "translateY(0)";
  event.currentTarget.style.boxShadow =
    "0 4px 14px rgba(57,79,73,0.05)";
}

export default function SuggestionsInbox() {
  const [suggestions, setSuggestions, serverState] = useServerCollection("submissions");
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [notice, setNotice] = useState("");
  const [noteDraft,setNoteDraft]=useState({id:null,text:""});



  const filteredSuggestions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return suggestions
      .filter((item) => filter === "All" || item.status === filter)
      .filter((item) => {
        if (!term) return true;

        return [
          item.name,
          item.email,
          item.category,
          item.subject,
          item.message,
          item.location,
          item.status,
        ].some((value) =>
          String(value || "").toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime() || 0;
        const dateB = new Date(b.createdAt).getTime() || 0;
        return dateB - dateA;
      });
  }, [suggestions, search, filter]);

  const selectedSuggestion =
    suggestions.find((item) => item.id === selectedId) || null;

  const newCount = suggestions.filter(
    (item) => item.status === "New"
  ).length;

  const reviewCount = suggestions.filter(
    (item) => item.status === "Under Review"
  ).length;

  const respondedCount = suggestions.filter(
    (item) => item.status === "Responded"
  ).length;

  async function updateStatus(id, status) {
    try {

    await setSuggestions((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );

    setNotice(`Suggestion marked as ${status.toLowerCase()}.`);
  
    } catch (error) { setNotice(error.message); }
  }

  async function clearDemoData() {
    const hasDemo = suggestions.some((item) => item.demo);

    if (!hasDemo) {
      setNotice("There are no demo entries to clear.");
      return;
    }

    setSuggestions((current) => current.filter((item) => !item.demo));

    setSelectedId((current) =>
      suggestions.some((item) => item.id === current && item.demo)
        ? null
        : current
    );

    setNotice("Demo entries cleared.");
  }

  const statCards = [
    { label: "Total Submissions", value: suggestions.length, icon: "" },
    { label: "New", value: newCount, icon: "" },
    { label: "Under Review", value: reviewCount, icon: "" },
    { label: "Responded", value: respondedCount, icon: "✓" },
  ];

  return (
    <main
      style={{
        minHeight: "100%",
        boxSizing: "border-box",
        padding: "8px 4px 32px",
        background: C.bg,
        color: C.dark,
      }}
    >
      <div style={{ maxWidth: "1380px", margin: "0 auto" }}>
      <CollectionStatus state={serverState}/>

        <header style={{ marginBottom: "30px" }}>
          <div
            style={{
              display: "inline-flex",
              padding: "7px 13px",
              marginBottom: "15px",
              borderRadius: "20px",
              background: C.greenBg,
              color: C.greenText,
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "0.6px",
            }}
          >
            CITIZEN FEEDBACK
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
            Citizen Suggestions &amp; Queries
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "760px",
              color: C.fern,
              fontSize: "17px",
              lineHeight: 1.7,
            }}
          >
            Review incoming feedback, track its status, and keep the inbox
            organised.
          </p>
        </header>

        {serverState.error && (
          <div
            role="alert"
            style={{
              marginBottom: "18px",
              padding: "13px 15px",
              borderRadius: "10px",
              background: C.redBg,
              color: C.red,
              fontSize: "15px",
            }}
          >
            {serverState.error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              marginBottom: "18px",
              padding: "12px 14px",
              borderRadius: "10px",
              background: C.greenBg,
              color: C.greenText,
              fontSize: "15px",
            }}
          >
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
              style={{
                ...buttonBase,
                padding: "4px 7px",
                background: "transparent",
                color: C.greenText,
              }}
            >
              ✕
            </button>
          </div>
        )}

        <section
          aria-label="Suggestion summary"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
            gap: "16px",
            marginBottom: "30px",
          }}
        >
          {statCards.map((stat) => (
            <article
              key={stat.label}
              style={{
                padding: "20px",
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: "14px",
                boxShadow: "0 4px 14px rgba(57,79,73,0.05)",
                boxSizing: "border-box",
                transition: "transform 180ms ease, box-shadow 180ms ease",
              }}
              onMouseEnter={cardMouseEnter}
              onMouseLeave={cardMouseLeave}
            >
              

              <p
                style={{
                  margin: "0 0 12px",
                  color: C.fern,
                  fontSize: "15px",
                  fontWeight: 400,
                }}
              >
                {stat.label}
              </p>

              <div
                style={{
                  color: C.dark,
                  fontSize: "28px",
                  lineHeight: 1.2,
                  fontWeight: 400,
                  letterSpacing: 0,
                }}
              >
                {stat.value}
              </div>
            </article>
          ))}
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 310px), 1fr))",
            alignItems: "start",
            gap: "20px",
          }}
        >
          <Panel>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "17px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: "0 0 5px",
                    color: C.dark,
                    fontSize: "23px",
                  }}
                >
                  Inbox
                </h2>
                <p style={{ margin: 0, color: C.muted, fontSize: "14px" }}>
                  {filteredSuggestions.length} result(s)
                </p>
              </div>

              <button
                type="button"
                onClick={clearDemoData}
                disabled={!suggestions.some((item) => item.demo)}
                style={{
                  ...buttonBase,
                  background: C.sage,
                  color: C.dark,
                  opacity: suggestions.some((item) => item.demo) ? 1 : 0.5,
                  cursor: suggestions.some((item) => item.demo)
                    ? "pointer"
                    : "not-allowed",
                }}
              >
                Clear demo entries
              </button>
            </div>

            <label
              style={{
                display: "grid",
                gap: "7px",
                marginBottom: "13px",
                color: C.dark,
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              Search submissions
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search subject, category, location..."
                style={inputStyle}
              />
            </label>

            <label
              style={{
                display: "grid",
                gap: "7px",
                marginBottom: "18px",
                color: C.dark,
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              Filter by status
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                style={inputStyle}
              >
                <option value="All">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            {filteredSuggestions.length === 0 ? (
              <div
                style={{
                  padding: "30px 16px",
                  textAlign: "center",
                  background: C.bg,
                  border: `1px dashed ${C.border}`,
                  borderRadius: "12px",
                }}
              >
                
                <strong style={{ color: C.dark, fontSize: "16px" }}>
                  No submissions found
                </strong>
                <p
                  style={{
                    margin: "7px 0 0",
                    color: C.muted,
                    fontSize: "14px",
                    lineHeight: 1.6,
                  }}
                >
                  Try another search or status filter.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "10px" }}>
                {filteredSuggestions.map((item) => {
                  const selected = item.id === selectedId;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(item.id);
                        setNotice("");
                      }}
                      aria-pressed={selected}
                      style={{
                        display: "block",
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "15px",
                        border: `1px solid ${
                          selected ? C.fern : C.border
                        }`,
                        borderRadius: "11px",
                        background: selected ? "#F2F6EF" : C.white,
                        textAlign: "left",
                        color: C.dark,
                        fontFamily: "inherit",
                        cursor: "pointer",
                        transition:
                          "transform 150ms ease, box-shadow 150ms ease",
                        boxShadow: "0 4px 14px rgba(57,79,73,0.05)",
                      }}
                      onMouseEnter={cardMouseEnter}
                      onMouseLeave={cardMouseLeave}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "9px",
                        }}
                      >
                        <strong
                          style={{
                            fontSize: "15px",
                            lineHeight: 1.5,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {item.subject}
                        </strong>

                        <span
                          style={{
                            ...statusColors(item.status),
                            flexShrink: 0,
                            padding: "5px 7px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 800,
                          }}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: "9px 0 7px",
                          color: C.fern,
                          fontSize: "13px",
                        }}
                      >
                        {item.category} · {item.name}
                      </p>

                      <p
                        style={{
                          margin: 0,
                          color: C.muted,
                          fontSize: "14px",
                          lineHeight: 1.6,
                        }}
                      >
                        {item.message.slice(0, 105)}
                        {item.message.length > 105 ? "…" : ""}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginTop: "11px",
                          color: C.muted,
                          fontSize: "12px",
                        }}
                      >
                        <span>{formatDate(item.createdAt)}</span>
                        {item.demo && (
                          <span
                            style={{
                              fontWeight: 800,
                              color: C.amberText,
                            }}
                          >
                            DEMO
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel>
            {!selectedSuggestion ? (
              <div
                style={{
                  padding: "34px 15px",
                  textAlign: "center",
                }}
              >
                
                <h2
                  style={{
                    margin: "0 0 8px",
                    color: C.dark,
                    fontSize: "22px",
                  }}
                >
                  Suggestion Details
                </h2>
                <p
                  style={{
                    maxWidth: "300px",
                    margin: "0 auto",
                    color: C.muted,
                    fontSize: "15px",
                    lineHeight: 1.7,
                  }}
                >
                  Select an item from the inbox to read the full submission
                  and update its status.
                </p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    marginBottom: "18px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: "0 0 7px",
                        color: C.fern,
                        fontSize: "13px",
                        fontWeight: 800,
                        letterSpacing: "0.6px",
                      }}
                    >
                      SUBMISSION DETAILS
                    </p>

                    <h2
                      style={{
                        margin: 0,
                        color: C.dark,
                        fontSize: "24px",
                        lineHeight: 1.4,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {selectedSuggestion.subject}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label="Close submission details"
                    style={{
                      ...buttonBase,
                      flexShrink: 0,
                      background: C.bg,
                      color: C.dark,
                      padding: "7px 10px",
                    }}
                  >
                    ✕
                  </button>
                </div>

                {selectedSuggestion.demo && (
                  <p
                    style={{
                      margin: "0 0 17px",
                      padding: "9px 11px",
                      borderRadius: "8px",
                      background: C.amberBg,
                      color: C.amberText,
                      fontSize: "13px",
                      lineHeight: 1.6,
                    }}
                  >
                    Demo entry — not a real citizen submission.
                  </p>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 125px), 1fr))",
                    gap: "11px",
                    marginBottom: "20px",
                  }}
                >
                  {[
                    ["Category", selectedSuggestion.category],
                    ["Submitted", formatDate(selectedSuggestion.createdAt)],
                    [
                      "Location",
                      selectedSuggestion.location || "Not provided",
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        padding: "12px",
                        borderRadius: "9px",
                        background: C.bg,
                        minWidth: 0,
                        overflowWrap: "anywhere",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 6px",
                          color: C.muted,
                          fontSize: "12px",
                        }}
                      >
                        {label}
                      </p>
                      <strong
                        style={{
                          color: C.dark,
                          fontSize: "14px",
                          lineHeight: 1.5,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {value}
                      </strong>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <h3
                    style={{
                      margin: "0 0 9px",
                      color: C.dark,
                      fontSize: "16px",
                    }}
                  >
                    Citizen
                  </h3>
                  <p
                    style={{
                      margin: "0 0 5px",
                      color: C.dark,
                      fontSize: "15px",
                    }}
                  >
                    {selectedSuggestion.name}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      color: C.muted,
                      fontSize: "14px",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {selectedSuggestion.email || "No email provided"}
                  </p>
                </div>

                <div style={{ marginBottom: "22px" }}>
                  <h3
                    style={{
                      margin: "0 0 9px",
                      color: C.dark,
                      fontSize: "16px",
                    }}
                  >
                    Message
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      padding: "15px",
                      borderRadius: "10px",
                      background: C.bg,
                      color: C.dark,
                      fontSize: "15px",
                      lineHeight: 1.8,
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {selectedSuggestion.message || "No message provided."}
                  </p>
                </div>

                <label style={{display:'grid',gap:8,color:C.dark,fontWeight:700,fontSize:14}}>Internal staff notes<textarea rows={3} value={noteDraft.id===selectedSuggestion.id?noteDraft.text:selectedSuggestion.staff_notes||''} onChange={event=>setNoteDraft({id:selectedSuggestion.id,text:event.target.value})} style={inputStyle}/></label>
                <button type="button" style={{...buttonBase,background:C.dark,color:C.white,margin:'12px 0'}} onClick={async()=>{try{await setSuggestions(rows=>rows.map(row=>row.id===selectedSuggestion.id?{...row,staff_notes:noteDraft.id===row.id?noteDraft.text:row.staff_notes||''}:row));setNotice('Internal notes saved. No email was sent.');}catch(error){setNotice(error.message);}}}>Save Notes</button>
                <label
                  style={{
                    display: "grid",
                    gap: "8px",
                    color: C.dark,
                    fontSize: "14px",
                    fontWeight: 800,
                  }}
                >
                  Update Status
                  <select
                    value={selectedSuggestion.status}
                    onChange={(event) =>
                      updateStatus(selectedSuggestion.id, event.target.value)
                    }
                    style={inputStyle}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "9px",
                    marginTop: "16px",
                  }}
                >
                  {selectedSuggestion.status !== "Under Review" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(selectedSuggestion.id, "Under Review")
                      }
                      style={{
                        ...buttonBase,
                        background: C.amberBg,
                        color: C.amberText,
                      }}
                    >
                      Mark Under Review
                    </button>
                  )}

                  {selectedSuggestion.status !== "Responded" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(selectedSuggestion.id, "Responded")
                      }
                      style={{
                        ...buttonBase,
                        background: C.dark,
                        color: C.white,
                      }}
                    >
                      Mark Responded
                    </button>
                  )}

                  {selectedSuggestion.status !== "Archived" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(selectedSuggestion.id, "Archived")
                      }
                      style={{
                        ...buttonBase,
                        background: C.sage,
                        color: C.dark,
                      }}
                    >
                      Archive
                    </button>
                  )}
                </div>
              </>
            )}
          </Panel>
        </div>
      </div>
    </main>
  );
}
