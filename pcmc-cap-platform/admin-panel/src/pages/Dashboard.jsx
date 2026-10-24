
import { Link } from "react-router-dom";

const dashboardItems = [
  {
    title: "Sectors",
    description: "Manage climate action sectors and their priorities.",
    path: "/sectors",
    icon: "",
  },
  {
    title: "Projects",
    description: "Review and manage climate action projects.",
    path: "/projects",
    icon: "",
  },
  {
    title: "Progress & Targets",
    description: "Track goals, targets, and progress updates.",
    path: "/progress",
    icon: "",
  },
  {
    title: "Map Data",
    description: "Explore climate layers and map information.",
    path: "/map-data",
    icon: "",
  },
  {
    title: "Resources",
    description: "Manage reports, plans, and awareness materials.",
    path: "/resources",
    icon: "",
  },
  {
    title: "Events",
    description: "Manage climate action events and activities.",
    path: "/events",
    icon: "",
  },
  {
    title: "Suggestions",
    description: "Review citizen suggestions when available.",
    path: "/suggestions",
    icon: "",
  },
  {
    title: "Admin Settings",
    description: "Review administration and platform settings.",
    path: "/admin-settings",
    icon: "",
  },
];

export default function Dashboard() {
  return (
    <div
      style={{
        minHeight: "100%",
        background: "#F5F7F6",
        padding: "8px 4px 32px",
        color: "#394F49",
      }}
    >
      {/* Dashboard heading */}
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
          PCMC CLIMATE ACTION
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
          Climate Action Dashboard
        </h1>

        <p
          style={{
            maxWidth: "720px",
            color: "#65743A",
            fontSize: "17px",
            lineHeight: "1.7",
          }}
        >
          Manage climate action initiatives, projects, targets, resources,
          and citizen engagement across PCMC.
        </p>
      </section>

      {/* Dashboard navigation cards */}
      <section
        aria-label="Dashboard navigation"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
          gap: "20px",
        }}
      >
        {dashboardItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              minHeight: "205px",
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #DCE3DD",
              borderRadius: "15px",
              boxShadow: "0 4px 14px rgba(57, 79, 73, 0.06)",
              color: "inherit",
              textDecoration: "none",
              overflow: "hidden",
              transition:
                "transform 150ms ease, box-shadow 150ms ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = "translateY(-3px)";
              event.currentTarget.style.boxShadow =
                "0 8px 20px rgba(57, 79, 73, 0.12)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = "translateY(0)";
              event.currentTarget.style.boxShadow =
                "0 4px 14px rgba(57, 79, 73, 0.06)";
            }}
          >
            {/* Thin green accent line */}
            <div
              aria-hidden="true"
              style={{
                height: "4px",
                background: "#65743A",
                borderRadius: "15px 15px 0 0",
                margin: "-24px -24px 22px",
                width: "calc(100% + 48px)",
                flexShrink: 0,
              }}
            />

            {/* Card icon */}
            

            {/* Card title */}
            <h2
              style={{
                margin: "0 0 8px",
                color: "#394F49",
                fontSize: "21px",
                lineHeight: "1.4",
                fontWeight: "750",
              }}
            >
              {item.title}
            </h2>

            {/* Card description */}
            <p
              style={{
                margin: "0 0 18px",
                color: "#65743A",
                fontSize: "15px",
                lineHeight: "1.7",
              }}
            >
              {item.description}
            </p>

            {/* View button */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "auto",
                padding: "8px 22px",
                border: "1px solid #385149",
                borderRadius: "7px",
                color: "#FFFFFF",
                background: "#385149",
                fontSize: "15px",
                fontWeight: "750",
                transition:
                  "background 150ms ease, border-color 150ms ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = "#2F7D4A";
                event.currentTarget.style.borderColor = "#2F7D4A";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "#385149";
                event.currentTarget.style.borderColor = "#385149";
              }}
            >
              View
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
