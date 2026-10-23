import { useServerCollection } from '../../../shared/useServerCollection';
import CollectionStatus from '../../../shared/CollectionStatus';

import { useState } from "react";
import mockContent from "../data/mockContent.json";

const sectors = Array.isArray(mockContent) ? mockContent : [];

const initialForm = {
  name: "",
  sectorId: "",
  status: "Draft",
  description: "",
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
  fontSize: "14px",
  lineHeight: "1.55",
  fontFamily: "inherit",
  outlineColor: "#2F7D4A",
};

const labelStyle = {
  display: "block",
  color: "#394F49",
  fontSize: "14px",
  fontWeight: "700",
};

const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "11px 19px",
  border: "1px solid #385149",
  borderRadius: "8px",
  background: "#385149",
  color: "#FFFFFF",
  cursor: "pointer",
  fontSize: "13px",
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
  return sectors.find((sector) => sector.id === sectorId)?.title || "No sector";
}

export default function Projects() {
  const [projects, setProjects, serverState] = useServerCollection("projects");
  const [form, setForm] = useState({ ...initialForm });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

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

  async function saveProject(event) {
    try {

    event.preventDefault();

    if (!form.name.trim()) {
      setMessage("Please enter a project name.");
      return;
    }

    if (!form.sectorId) {
      setMessage("Please select a sector.");
      return;
    }

    if (editingId !== null) {
      await setProjects((previous) =>
        previous.map((project) =>
          project.id === editingId
            ? { ...project, ...form, name: form.name.trim() }
            : project
        )
      );
      setMessage("Project updated successfully on the server.");
    } else {
      const newProject = {
        ...form,
        name: form.name.trim(),
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };

      await setProjects((previous) => [newProject, ...previous]);
      setMessage("Project added successfully on the server.");
    }

    setForm({ ...initialForm });
    setEditingId(null);
  
    } catch (error) { setMessage(error.message); }
  }

  function editProject(project) {
    setForm({
      name: project.name,
      sectorId: project.sectorId,
      status: project.status,
      description: project.description || "",
    });

    setEditingId(project.id);
    setMessage("");

    document.getElementById("project-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function deleteProject(projectId) {
    try {

    await setProjects((previous) =>
      previous.filter((project) => project.id !== projectId)
    );

    if (editingId === projectId) {
      resetForm();
    }

    setMessage("Project removed from the server.");
  
    } catch (error) { setMessage(error.message); }
  }

  async function changeProjectStatus(projectId, status) {
    try {

    await setProjects((previous) =>
      previous.map((project) =>
        project.id === projectId ? { ...project, status } : project
      )
    );

    setMessage("Project status updated on the server.");
  
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

  const visibleProjects =
    filterStatus === "All"
      ? projects
      : projects.filter((project) => project.status === filterStatus);

  const counts = {
    total: projects.length,
    draft: projects.filter((project) => project.status === "Draft").length,
    published: projects.filter((project) => project.status === "Published")
      .length,
    archived: projects.filter((project) => project.status === "Archived").length,
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
              fontSize: "11px",
              fontWeight: "800",
              letterSpacing: "0.6px",
              marginBottom: "15px",
            }}
          >
            PROJECT MANAGEMENT
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
            Projects
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
            Create and manage climate action projects, assign sectors, and
            update project statuses.
          </p>
        </section>

        <section
          aria-label="Project summary"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
            gap: "16px",
            marginBottom: "30px",
          }}
        >
          {[
            { label: "Total Projects", value: counts.total, icon: "📋" },
            { label: "Draft", value: counts.draft, icon: "📝" },
            { label: "Published", value: counts.published, icon: "🌿" },
            { label: "Archived", value: counts.archived, icon: "📦" },
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
              <div style={{ fontSize: "22px", marginBottom: "12px" }}>
                {item.icon}
              </div>
              <p
                style={{
                  margin: "0 0 6px",
                  color: "#65743A",
                  fontSize: "13px",
                }}
              >
                {item.label}
              </p>
              <strong style={{ fontSize: "27px", color: "#394F49" }}>
                {item.value}
              </strong>
            </article>
          ))}
        </section>

        <section
          id="project-form"
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
                fontSize: "10px",
                fontWeight: "800",
                letterSpacing: "0.5px",
              }}
            >
              {editingId !== null ? "EDIT PROJECT" : "NEW PROJECT"}
            </span>

            <h2
              style={{
                margin: "12px 0 7px",
                color: "#394F49",
                fontSize: "23px",
              }}
            >
              {editingId !== null ? "Edit Project" : "Add Project"}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#65743A",
                fontSize: "14px",
                lineHeight: "1.7",
              }}
            >
              Enter the project details below. All fields can be tested in
              this frontend session.
            </p>
          </div>

          <form onSubmit={saveProject} style={{ padding: "28px" }}>
            <label style={labelStyle}>
              Project Name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Enter project name"
                required
                style={inputStyle}
              />
            </label>

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

            <label style={labelStyle}>
              Project Description
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                placeholder="Describe the project, its objectives, and planned activities"
                rows={4}
                style={{ ...inputStyle, resize: "vertical", minHeight: "110px" }}
              />
            </label>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                borderTop: "1px solid #DCE3DD",
                paddingTop: "22px",
              }}
            >
              <button
                type="submit"
                style={primaryButtonStyle}
                onMouseEnter={handlePrimaryEnter}
                onMouseLeave={handlePrimaryLeave}
              >
                {editingId !== null ? "Save Changes" : "Save Project"}
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
                  borderRadius: "9px",
                  background: "#E8F3E9",
                  border: "1px solid #CFE5D2",
                  color: "#2F7D4A",
                  fontSize: "13px",
                  fontWeight: "700",
                  lineHeight: "1.6",
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
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: "0 0 8px",
                  color: "#394F49",
                  fontSize: "24px",
                }}
              >
                Project Records
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "#65743A",
                  fontSize: "14px",
                  lineHeight: "1.6",
                }}
              >
                {projects.length === 0
                  ? "Your newly created projects will appear here."
                  : `${projects.length} project${projects.length === 1 ? "" : "s"} in this session.`}
              </p>
            </div>

            <select
              aria-label="Filter projects by status"
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              style={{
                ...inputStyle,
                width: "auto",
                minWidth: "160px",
                margin: 0,
              }}
            >
              <option value="All">All statuses</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {visibleProjects.length === 0 ? (
            <div
              style={{
                padding: "34px 25px",
                background: "#FFFFFF",
                border: "1px solid #DCE3DD",
                borderRadius: "15px",
                textAlign: "center",
                boxShadow: "0 4px 14px rgba(57,79,73,0.05)",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>
                📋
              </div>
              <h3
                style={{
                  margin: "0 0 8px",
                  color: "#394F49",
                  fontSize: "19px",
                }}
              >
                {projects.length === 0
                  ? "No projects added yet"
                  : "No projects match this filter"}
              </h3>
              <p
                style={{
                  maxWidth: "520px",
                  margin: "0 auto",
                  color: "#65743A",
                  fontSize: "14px",
                  lineHeight: "1.7",
                }}
              >
                {projects.length === 0
                  ? "Use the form above to add your first project and test the management controls."
                  : "Choose another status to see more projects."}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 270px), 1fr))",
                gap: "18px",
              }}
            >
              {visibleProjects.map((project) => (
                <article
                  key={project.id}
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
                    event.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(57,79,73,0.12)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.transform = "translateY(0)";
                    event.currentTarget.style.boxShadow =
                      "0 4px 14px rgba(57,79,73,0.06)";
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
                      alignSelf: "flex-start",
                      padding: "6px 10px",
                      borderRadius: "20px",
                      background:
                        project.status === "Published"
                          ? "#E8F3E9"
                          : project.status === "Archived"
                            ? "#ECEFED"
                            : "#FFF4D9",
                      color:
                        project.status === "Published"
                          ? "#2F7D4A"
                          : project.status === "Archived"
                            ? "#65716A"
                            : "#8A6A1D",
                      fontSize: "11px",
                      fontWeight: "800",
                    }}
                  >
                    {project.status}
                  </span>

                  <h3
                    style={{
                      margin: "15px 0 8px",
                      color: "#394F49",
                      fontSize: "19px",
                      lineHeight: "1.4",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {project.name}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 12px",
                      color: "#65743A",
                      fontSize: "13px",
                      lineHeight: "1.6",
                    }}
                  >
                    <strong>Sector:</strong>{" "}
                    {getSectorTitle(project.sectorId)}
                  </p>

                  {project.description && (
                    <p
                      style={{
                        margin: "0 0 18px",
                        color: "#65743A",
                        fontSize: "13px",
                        lineHeight: "1.7",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {project.description}
                    </p>
                  )}

                  <label
                    style={{
                      ...labelStyle,
                      marginTop: "auto",
                      fontSize: "12px",
                    }}
                  >
                    Update Status
                    <select
                      value={project.status}
                      onChange={(event) =>
                        changeProjectStatus(project.id, event.target.value)
                      }
                      style={{
                        ...inputStyle,
                        marginBottom: "15px",
                      }}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </label>

                  <div
                    style={{
                      display: "flex",
                      gap: "9px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => editProject(project)}
                      style={primaryButtonStyle}
                      onMouseEnter={handlePrimaryEnter}
                      onMouseLeave={handlePrimaryLeave}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteProject(project.id)}
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
