
import { Link } from "react-router-dom";
import mockContent from "../data/mockContent.json";


export default function Sectors() {
  const sectors = Array.isArray(mockContent) ? mockContent : [];

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
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        {/* Page heading — matches Dashboard spacing */}
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
            CLIMATE SECTORS
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
            Climate Sectors
          </h1>

          <p
            style={{
              maxWidth: "720px",
              margin: 0,
              color: "#65743A",
              fontSize: "17px",
              lineHeight: "1.7",
            }}
          >
            Browse the sector catalogue and its associated information.
          </p>
        </section>

        {/* Sector cards */}
        {sectors.length === 0 ? (
          <section
            style={{
              padding: "28px",
              background: "#FFFFFF",
              border: "1px solid #DCE3DD",
              borderRadius: "16px",
              color: "#65743A",
              lineHeight: "1.7",
            }}
          >
            <h2
              style={{
                margin: "0 0 8px",
                color: "#394F49",
              }}
            >
              No catalogue entries available
            </h2>

            <p style={{ margin: 0 }}>
              There are currently no sectors to display.
            </p>
          </section>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
              gap: "20px",
            }}
          >
            {sectors.map((sector) => (
              <article
                key={sector.id}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  minHeight: "235px",
                  padding: "25px",
                  boxSizing: "border-box",
                  background: "#FFFFFF",
                  border: "1px solid #DCE3DD",
                  borderRadius: "15px",
                  boxShadow: "0 4px 14px rgba(57, 79, 73, 0.06)",
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
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "5px",
                    background: "#65743A",
                  }}
                />

                {/* Sector icon */}
                

                {/* Sector title */}
                <h2
                  style={{
                    margin: "0 0 9px",
                    color: "#394F49",
                    fontSize: "20px",
                    lineHeight: "1.4",
                    fontWeight: "750",
                    overflowWrap: "anywhere",
                  }}
                >
                  {sector.title}
                </h2>

                {/* Catalogue ID */}
                <p
                  style={{
                    margin: "0 0 18px",
                    color: "#65743A",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    flex: 1,
                    overflowWrap: "anywhere",
                  }}
                >
                  Catalogue ID: {sector.id}
                </p>

                {/* View/Edit button */}
                <Link
                  to={`/sectors/${sector.id}/edit`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    border: "1px solid #385149",
                    borderRadius: "8px",
                    background: "#385149",
                    color: "#FFFFFF",
                    textDecoration: "none",
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
                  View Edit Page →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
