const f = (name, label, type = "text", extra = {}) => ({
  name,
  label,
  type,
  ...extra,
});
const bilingual = (name, label, type = "text", extra = {}) => [
  f(name, `${label} (English)`, type, extra),
  f(`${name}_mr`, `${label} (Marathi)`, type),
];
const text = (name, label, required = false) =>
  bilingual(name, label, "textarea", { required });
export const schemas = {
  sectors: {
    title: "Sector content",
    fields: [
      ...text("currentScenario", "Current scenario"),
      ...text("whyItMatters", "Why it matters"),
      ...text("plannedActions", "Planned actions — one per line"),
      ...text("citizenActions", "Citizen actions — one per line"),
      ...text("relevantAreas", "Relevant areas — one per line"),
      f("icon", "Icon / emoji"),
    ],
  },
  events: {
    title: "Events",
    fields: [
      f("date", "Start date and time", "datetime-local", { required: true }),
      f("end_date", "End date and time", "datetime-local"),
      ...bilingual("location", "Location"),
      ...text("description", "Description"),
      f("image", "Poster", "url", { upload: true }),
      f("link", "Registration / information link", "url"),
    ],
  },
  initiatives: {
    title: "CEE initiatives",
    fields: [
      f("date", "Date", "date"),
      ...text("description", "Description", true),
      f("photos", "Photo URLs — one per line", "textarea", { upload: true }),
      ...bilingual("caption", "Photo caption"),
    ],
  },
  resources: {
    title: "Resources",
    fields: [
      f("category", "Category", "select", {
        options: ["Guide", "Report", "Scheme", "Manual", "Other"],
      }),
      ...text("description", "Description"),
      f("url", "Document / website URL", "url", {
        required: true,
        upload: true,
      }),
      f("source", "Source"),
    ],
  },
  projects: {
    title: "Projects",
    fields: [
      ...text("description", "Description"),
      f("sector", "Sector"),
      f("location", "Location"),
      f("stage", "Stage", "select", {
        options: ["Planned", "Ongoing", "Completed"],
      }),
      f("url", "Information URL", "url"),
    ],
  },
  map: {
    title: "Map features",
    fields: [
      f("layer", "Layer", "select", {
        options: [
          "greenSpaces",
          "municipalBuildings",
          "pedestrianStreets",
          "floodRisk",
          "heatRisk",
          "water",
          "waste",
          "mobility",
          "projects",
        ],
      }),
      f("geometry", "Geometry", "select", { options: ["point", "line"] }),
      f("latitude", "Latitude", "number", { min: -90, max: 90 }),
      f("longitude", "Longitude", "number", { min: -180, max: 180 }),
      f(
        "coordinates",
        "Line coordinates — JSON pairs [latitude, longitude]",
        "textarea",
      ),
      ...text("description", "Description"),
      f("source", "Verified source"),
    ],
  },
  settings: {
    title: "Site settings",
    singleton: true,
    fields: [
      ...text("about", "About CEE"),
      ...text("initiative", "About the initiative"),
      f("instagram", "Instagram URL", "url"),
      f("facebook", "Facebook URL", "url"),
      f("youtube", "YouTube URL", "url"),
      ...bilingual("suggestion_question", "Suggestion question"),
      ...bilingual("query_question", "Query question"),
      ...text("privacy", "Submission privacy notice"),
      f("contact_email", "Contact email", "email"),
    ],
  },
};
export const apiSchemas = {
  indicators: {
    title: "Progress indicators",
    endpoint: "indicators/",
    fields: [
      f("name", "Indicator name", "text", { required: true }),
      f("unit", "Unit", "text", { required: true }),
      f("target_value", "Target value", "number", { required: true }),
      f("target_date", "Target date", "date"),
    ],
  },
  "progress-entries": {
    title: "Progress reports",
    endpoint: "progress-entries/",
    fields: [
      f("indicator", "Indicator", "select", {
        lookup: "indicators/",
        required: true,
      }),
      f("actual_value", "Actual value", "number", { required: true }),
      f("reported_date", "Reporting date", "date", { required: true }),
      f("remarks", "Remarks", "textarea"),
    ],
  },
  "vendor-categories": {
    title: "Vendor categories",
    endpoint: "vendor-categories/",
    fields: [f("name", "Category name", "text", { required: true })],
  },
  vendors: {
    title: "Vendor directory",
    endpoint: "vendors/",
    fields: [
      f("name", "Vendor name", "text", { required: true }),
      f("category", "Category", "select", {
        lookup: "vendor-categories/",
        required: true,
      }),
      f("phone_number", "Phone number", "tel", {
        required: true,
        pattern: "[0-9]{10}",
        maxLength: 10,
      }),
      f("email", "Email", "email", { required: true }),
      f("address", "Address", "textarea", { required: true }),
      f("urlfield", "Website", "url"),
      f("notes", "Notes", "textarea"),
      f("is_active", "Show publicly", "checkbox"),
    ],
  },
  submissions: {
    title: "Suggestions and queries",
    endpoint: "submissions/",
    noCreate: true,
    fields: [
      f("kind", "Type", "text", { readOnly: true }),
      f("name", "Name", "text", { readOnly: true }),
      f("email", "Email", "email", { readOnly: true }),
      f("subject", "Subject", "text", { readOnly: true }),
      f("message", "Message", "textarea", { readOnly: true }),
      f("location", "Location", "text", { readOnly: true }),
      f("status", "Status", "select", {
        options: [
          ["new", "New"],
          ["review", "Under review"],
          ["responded", "Responded"],
          ["archived", "Archived"],
        ],
      }),
      f("staff_notes", "Internal notes (not sent to citizen)", "textarea"),
    ],
  },
};
