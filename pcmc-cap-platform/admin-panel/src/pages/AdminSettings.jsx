import SiteSettingsEditor from '../components/SiteSettingsEditor';
import { useState } from "react";

const C = {
  bg: "#F5F7F6",
  dark: "#394F49",
  green: "#65743A",
  buttonDark: "#394F49",
  buttonHover: "#2E7D4A",
  white: "#FFFFFF",
  border: "#DCE3DD",
  muted: "#75817B",
  lightGreen: "#E8EEE3",
};

const sections = [
  {
    title: "Backend & Data Sources",
    icon: "🗄️",
    status: "Configuration Required",
    description:
      "Manage backend connections and data sources used by the admin panel.",
    details: [
      "Configure the backend API connection.",
      "Verify data source availability.",
      "Check connection settings before enabling live data.",
    ],
  },
  {
    title: "Access & Security",
    icon: "🔐",
    status: "Review Settings",
    description:
      "Review access and security settings for the admin workspace.",
    details: [
      "Review administrator access permissions.",
      "Verify authentication and authorization settings.",
      "Ensure sensitive settings are handled securely.",
    ],
  },
  {
    title: "Data Import & Export",
    icon: "📁",
    status: "Available for Setup",
    description:
      "Manage options for importing and exporting administrative data.",
    details: [
      "Plan supported import file formats.",
      "Validate data before importing.",
      "Confirm export requirements and permissions.",
    ],
  },
  {
    title: "Platform Configuration",
    icon: "⚙️",
    status: "Configuration Required",
    description:
      "Review general platform settings and administrative preferences.",
    details: [
      "Review platform-wide configuration options.",
      "Verify application preferences.",
      "Confirm configuration changes before applying them.",
    ],
  },
];

export default function AdminSettings() {
  const [expandedSection, setExpandedSection] = useState(null);

  const cardStyle = {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: 26,
    boxShadow: "0 4px 14px rgba(57,79,73,0.05)",
    transition: "transform 150ms ease, box-shadow 150ms ease",
    boxSizing: "border-box",
    minWidth: 0,
  };

  const handleCardEnter = (event) => {
    event.currentTarget.style.transform = "translateY(-3px)";
    event.currentTarget.style.boxShadow =
      "0 8px 20px rgba(57,79,73,0.12)";
  };

  const handleCardLeave = (event) => {
    event.currentTarget.style.transform = "translateY(0)";
    event.currentTarget.style.boxShadow =
      "0 4px 14px rgba(57,79,73,0.05)";
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background: C.bg,
        padding: "8px 4px 32px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1380,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Page heading */}
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              margin: "0 0 8px",
              color: C.dark,
              fontSize: 36,
              fontWeight: 600,
              letterSpacing: "-0.8px",
            }}
          >
            Admin Settings
          </h1>

          <p
            style={{
              margin: 0,
              color: C.muted,
              fontSize: 15,
              lineHeight: 1.6,
            }}
          >
            Manage configuration options and review your platform settings.
          </p>
        </div>

        {/* Settings section heading */}
        <div style={{ marginBottom: 20 }}>
          <h2
            style={{
              margin: "0 0 6px",
              color: C.dark,
              fontSize: 23,
              fontWeight: 600,
            }}
          >
            Settings & Management
          </h2>

          <p
            style={{
              margin: 0,
              color: C.muted,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Review each section to see its configuration information.
          </p>
        </div>

        {/* Two larger cards per row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 22,
            alignItems: "start",
          }}
        >
          {sections.map((section) => {
            const isExpanded = expandedSection === section.title;

            return (
              <div
                key={section.title}
                style={cardStyle}
                onMouseEnter={handleCardEnter}
                onMouseLeave={handleCardLeave}
              >
                {/* Card heading */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 15,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      minWidth: 54,
                      borderRadius: 13,
                      background: C.lightGreen,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                    }}
                  >
                    {section.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        margin: "4px 0 10px",
                        color: C.dark,
                        fontSize: 19,
                        fontWeight: 600,
                        lineHeight: 1.4,
                      }}
                    >
                      {section.title}
                    </h3>

                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: 7,
                        background: C.lightGreen,
                        color: C.green,
                        fontSize: 12,
                        fontWeight: 500,
                        lineHeight: 1.5,
                      }}
                    >
                      {section.status}
                    </span>
                  </div>
                </div>

                {/* Card description */}
                <p
                  style={{
                    margin: "0 0 22px",
                    color: C.muted,
                    fontSize: 15,
                    lineHeight: 1.8,
                  }}
                >
                  {section.description}
                </p>

                {/* Expandable details */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: `1px solid ${C.border}`,
                      paddingTop: 18,
                      marginBottom: 20,
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 12px",
                        color: C.dark,
                        fontSize: 15,
                        fontWeight: 600,
                      }}
                    >
                      Configuration Details
                    </h4>

                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: 21,
                        color: C.muted,
                        fontSize: 14,
                        lineHeight: 1.9,
                      }}
                    >
                      {section.details.map((detail) => (
                        <li key={detail} style={{ marginBottom: 6 }}>
                          {detail}
                        </li>
                      ))}
                    </ul>
                    {section.title === "Platform Configuration" && <SiteSettingsEditor/>}
                  </div>
                )}

                {/* View / Hide Details button */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSection(
                      isExpanded ? null : section.title
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "18px 20px",
                    borderRadius: 10,
                    border: "none",
                    background: C.buttonDark,
                    color: C.white,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 150ms ease",
                    boxSizing: "border-box",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = C.buttonHover;
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = C.buttonDark;
                  }}
                >
                  {isExpanded ? "Hide Details ↑" : "View Details →"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}