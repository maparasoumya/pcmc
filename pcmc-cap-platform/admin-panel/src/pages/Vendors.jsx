import { request } from '../../../shared/api';
import { useRemote } from '../../../shared/useRemote';
import { useServerCollection } from '../../../shared/useServerCollection';
import CollectionStatus from '../../../shared/CollectionStatus';

import { useMemo, useState } from "react";



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
  fontSize: "16px",
  lineHeight: "1.5",
  outlineColor: "#385149",
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block",
  color: "#394F49",
  fontSize: "16px",
  fontWeight: "700",
};

const primaryButtonStyle = {
  padding: "10px 16px",
  border: "1px solid #385149",
  borderRadius: "8px",
  background: "#385149",
  color: "#FFFFFF",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
  fontFamily: "inherit",
  transition: "all 0.2s ease",
};

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  background: "#FFFFFF",
  color: "#385149",
};


const initialForm = {
  url:"",phone_number:"",email:"",
  title: "",
  category: "",
  description: "",
  source: "",
  status: "Draft",
};



function getStatusStyle(status) {
  if (status === "Published") {
    return { background: "#E8F3E9", color: "#2F7D4A" };
  }

  if (status === "Archived") {
    return { background: "#ECEFED", color: "#65716A" };
  }

  return { background: "#FFF4D9", color: "#8A6A1D" };
}

export default function Vendors() {
  const categories=useRemote("vendor-categories/",true);
  const resourceCategories=categories.data.map(item=>String(item.id));
  const [categoryName,setCategoryName]=useState("");
  const [resources, setResources, serverState] = useServerCollection("vendors");
  const [form, setForm] = useState({ ...initialForm });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");



  const filteredResources = useMemo(() => {
    const term = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const title = (resource.title || "").toLowerCase();
      const description = (resource.description || "").toLowerCase();
      const source = (resource.source || "").toLowerCase();

      const matchesSearch =
        !term ||
        title.includes(term) ||
        description.includes(term) ||
        source.includes(term);

      const matchesCategory =
        categoryFilter === "All" ||
        resource.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        resource.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [resources, search, categoryFilter, statusFilter]);

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

  async function saveResource(event) {
    try {

    event.preventDefault();

    if (!form.title.trim()) {
      setMessage("Please enter a resource title.");
      return;
    }

    const resourceData = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      source: form.source.trim(),
    };

    if (editingId !== null) {
      await setResources((previous) =>
        previous.map((resource) =>
          resource.id === editingId
            ? { ...resource, ...resourceData }
            : resource
        )
      );
      setMessage("Resource updated successfully.");
    } else {
      await setResources((previous) => [
        {
          ...resourceData,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        },
        ...previous,
      ]);
      setMessage("Resource added successfully.");
    }

    setForm({ ...initialForm });
    setEditingId(null);
  
    } catch (error) { setMessage(error.message); }
  }

  function editResource(resource) {
    setForm({
      url:resource.url||"",phone_number:resource.phone_number||"",email:resource.email||"",
      title: resource.title || "",
      category: resource.category || "Guidelines",
      description: resource.description || "",
      source: resource.source || "",
      status: resource.status || "Draft",
    });

    setEditingId(resource.id);
    setMessage("");

    document.getElementById("resource-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function deleteResource(id) {
    try {

    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    await setResources((previous) =>
      previous.filter((resource) => resource.id !== id)
    );

    if (editingId === id) {
      setForm({ ...initialForm });
      setEditingId(null);
    }

    setMessage("Resource deleted.");
  
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
    total: resources.length,
    published: resources.filter((item) => item.status === "Published").length,
    drafts: resources.filter((item) => item.status === "Draft").length,
    archived: resources.filter((item) => item.status === "Archived").length,
  };

  const statCards = [
    { label: "Total Vendor Directory", value: counts.total, icon: "" },
    { label: "Published", value: counts.published, icon: "" },
    { label: "Drafts", value: counts.drafts, icon: "" },
    { label: "Archived", value: counts.archived, icon: "✓" },
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
            CLIMATE RESOURCES
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
            Vendor Directory
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
            Manage climate guidelines, reports, plans, and awareness materials.
          </p>
        </section>

        {/* Summary cards — sized to match Progress */}
        <section
          aria-label="Resource summary"
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
                padding: "20px",
                boxSizing: "border-box",
                background: "#FFFFFF",
                border: "1px solid #DCE3DD",
                borderRadius: "14px",
                boxShadow: "0 4px 14px rgba(57,79,73,0.05)",
                transition: "transform 180ms ease, box-shadow 180ms ease",
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
              

              <p
                style={{
                  margin: "0 0 12px",
                  color: "#65743A",
                  fontSize: "15px",
                  fontWeight: "400",
                }}
              >
                {item.label}
              </p>

              <div
                style={{
                  color: "#394F49",
                  fontSize: "28px",
                  lineHeight: "1.2",
                  fontWeight: "400",
                  letterSpacing: "0",
                }}
              >
                {item.value}
              </div>
            </article>
          ))}
        </section>

        {/* Add or edit resource */}
        <section
          id="resource-form"
          style={{
            background: "#FFFFFF",
            border: "1px solid #DCE3DD",
            borderRadius: "16px",
            boxShadow: "0 4px 14px rgba(57, 79, 73, 0.07)",
            overflow: "hidden",
            marginBottom: "34px",
          }}
        >
          <div style={{ height: "5px", background: "#65743A" }} />

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
                fontSize: "26px",
              }}
            >
              {editingId !== null ? "Edit Resource" : "Add Resource"}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#65743A",
                fontSize: "16px",
                lineHeight: "1.6",
              }}
            >
              Add and manage climate-related resources.
            </p>
          </div>

          <form onSubmit={saveResource} style={{ padding: "28px" }}>
            <label style={labelStyle}>
              Vendor Name *
              <input
                name="title"
                value={form.title}
                onChange={updateField}
                required
                placeholder="Resource title"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Category
              <select
                name="category"
                value={form.category}
                onChange={updateField}
                style={inputStyle}
              >
                <option value="">Select category</option>{categories.data.map(category=><option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>

            <label style={labelStyle}>New category<input value={categoryName} onChange={event=>setCategoryName(event.target.value)} style={inputStyle}/><button type="button" style={secondaryButtonStyle} onClick={async()=>{try{await request('vendor-categories/',{method:'POST',authenticated:true,body:{name:categoryName}});categories.reload();setCategoryName('');}catch(error){setMessage(error.message);}}}>Add Category</button></label>
            <label style={labelStyle}>
              Notes
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                rows={5}
                placeholder="Resource description"
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </label>

            <label style={labelStyle}>Website URL<input name="url" type="url" value={form.url} onChange={updateField} style={inputStyle}/></label>
            <label style={labelStyle}>Phone number<input name="phone_number" required pattern="[0-9]{10}" value={form.phone_number} onChange={updateField} style={inputStyle}/></label>
            <label style={labelStyle}>Email<input name="email" required type="email" value={form.email} onChange={updateField} style={inputStyle}/></label>
            <label style={labelStyle}>
              Address
              <input
                name="source"
                value={form.source}
                onChange={updateField}
                placeholder="Source or reference"
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
                  fontSize: "15px",
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
                {editingId !== null ? "Update Vendor" : "Save Vendor"} →
              </button>

              {editingId !== null && (
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
                    event.currentTarget.style.borderColor = "#385149";
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Resource records */}
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
              <h2
                style={{
                  margin: "0 0 8px",
                  color: "#394F49",
                  fontSize: "26px",
                }}
              >
                Resource Records
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#65743A",
                  fontSize: "16px",
                  lineHeight: "1.6",
                }}
              >
                View and manage your resource entries.
              </p>
            </div>

            <span
              style={{
                color: "#394F49",
                fontSize: "16px",
                fontWeight: "400",
              }}
            >
              {filteredResources.length} of {resources.length} resources
            </span>
          </div>

          {/* Search and filters */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
              gap: "12px",
              padding: "20px",
              background: "#FFFFFF",
              border: "1px solid #DCE3DD",
              borderRadius: "13px",
              marginBottom: "20px",
            }}
          >
            <input
              aria-label="Search resources"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search resources..."
              style={{ ...inputStyle, margin: 0 }}
            />

            <select
              aria-label="Filter by category"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              style={{ ...inputStyle, margin: 0 }}
            >
              <option value="All">All Categories</option>
              {resourceCategories.map((category) => (
                <option key={categories.data.find(item=>String(item.id)===String(category))?.name||category} value={categories.data.find(item=>String(item.id)===String(category))?.name||category}>
                  {categories.data.find(item=>String(item.id)===String(category))?.name||category}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={{ ...inputStyle, margin: 0 }}
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {filteredResources.length === 0 ? (
            <div
              style={{
                padding: "36px 25px",
                background: "#FFFFFF",
                border: "1px solid #DCE3DD",
                borderRadius: "16px",
                boxShadow: "0 4px 14px rgba(57, 79, 73, 0.07)",
                textAlign: "center",
              }}
            >
              

              <h3
                style={{
                  margin: "0 0 8px",
                  color: "#394F49",
                  fontSize: "22px",
                }}
              >
                {resources.length === 0
                  ? "No resources yet"
                  : "No matching resources"}
              </h3>

              <p
                style={{
                  maxWidth: "540px",
                  margin: "0 auto",
                  color: "#65743A",
                  fontSize: "16px",
                  lineHeight: "1.7",
                }}
              >
                {resources.length === 0
                  ? "Add your first resource using the form above."
                  : "Try changing your search or filters."}
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
              {filteredResources.map((resource) => (
                <article
                  key={resource.id}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #DCE3DD",
                    borderRadius: "15px",
                    boxShadow: "0 4px 14px rgba(57, 79, 73, 0.06)",
                    overflow: "hidden",
                    transition: "transform 150ms ease, box-shadow 150ms ease",
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
                  <div style={{ height: "5px", background: "#65743A" }} />

                  <div style={{ padding: "22px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
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
                          background: "#E8F3E9",
                          color: "#2F7D4A",
                          fontSize: "13px",
                          fontWeight: "700",
                        }}
                      >
                        {resource.category}
                      </span>

                      <span
                        style={{
                          ...getStatusStyle(resource.status),
                          display: "inline-flex",
                          padding: "5px 9px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: "700",
                        }}
                      >
                        {resource.status}
                      </span>
                    </div>

                    <h3
                      style={{
                        margin: "0 0 10px",
                        color: "#394F49",
                        fontSize: "21px",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {resource.title}
                    </h3>

                    <p
                      style={{
                        margin: "0 0 15px",
                        color: "#65743A",
                        fontSize: "16px",
                        lineHeight: "1.7",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {resource.description || "No description provided."}
                    </p>

                    {resource.source && (
                      <p
                        style={{
                          margin: "0 0 18px",
                          color: "#65743A",
                          fontSize: "15px",
                          lineHeight: "1.6",
                          overflowWrap: "anywhere",
                        }}
                      >
                        <strong style={{ color: "#394F49" }}>
                          Source:{" "}
                        </strong>
                        {resource.source}
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
                        onClick={() => editResource(resource)}
                        style={primaryButtonStyle}
                        onMouseEnter={primaryEnter}
                        onMouseLeave={primaryLeave}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteResource(resource.id)}
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
