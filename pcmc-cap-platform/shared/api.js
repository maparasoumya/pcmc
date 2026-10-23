const configuredBase = import.meta.env.VITE_API_URL;
export const API_BASE = (
  configuredBase || (import.meta.env.PROD ? "" : "http://localhost:8000/api")
).replace(/\/$/, "");
const TOKEN_KEY = "pcmc_token";
export const token = () => sessionStorage.getItem(TOKEN_KEY);
export function clearAuth() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem("pcmc_user");
}
export async function request(
  path,
  { body, method = "GET", signal, authenticated = false } = {},
) {
  if (!API_BASE)
    throw new Error(
      "The API URL is not configured. Set VITE_API_URL and rebuild the frontend.",
    );
  const headers = {};
  if (authenticated && token()) headers.Authorization = `Token ${token()}`;
  if (body && !(body instanceof FormData))
    headers["Content-Type"] = "application/json";
  let response;
  try {
    response = await fetch(`${API_BASE}/${path.replace(/^\//, "")}`, {
      method,
      headers,
      signal,
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Unable to reach the server. Please try again.");
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      clearAuth();
      window.dispatchEvent(new Event("pcmc-auth-expired"));
    }
    const message =
      data.detail ||
      Object.entries(data)
        .map(
          ([key, value]) =>
            `${key}: ${Array.isArray(value) ? value.join(" ") : typeof value === "object" ? JSON.stringify(value) : value}`,
        )
        .join("; ");
    throw new Error(message || `Request failed (${response.status}).`);
  }
  return data;
}
export async function list(path, options) {
  const data = await request(path, options);
  return Array.isArray(data) ? data : data.results || [];
}
export const publications = (kind, options) =>
  list(`publications/?kind=${kind}`, options);
export async function login(username, password) {
  const data = await request("auth/token/", {
    method: "POST",
    body: { username, password },
  });
  if (!data.user.is_staff)
    throw new Error("This account does not have staff access.");
  sessionStorage.setItem(TOKEN_KEY, data.token);
  sessionStorage.setItem("pcmc_user", JSON.stringify(data.user));
  return data.user;
}
export async function logout() {
  try {
    await request("auth/logout/", { method: "POST", authenticated: true });
  } finally {
    clearAuth();
  }
}
export function safeUrl(value) {
  if (!value) return "";
  try {
    const u = new URL(value);
    return ["http:", "https:"].includes(u.protocol) ? u.href : "";
  } catch {
    return "";
  }
}
export function localText(data, key, language) {
  return language === "mr" && data[`${key}_mr`]
    ? data[`${key}_mr`]
    : data[key] || "";
}
export function activeEvents(rows, now = Date.now()) {
  return rows
    .filter((row) => {
      const end = new Date(row.data.end_date || row.data.date).getTime();
      return Number.isFinite(end) && end >= now;
    })
    .sort((a, b) => new Date(a.data.date) - new Date(b.data.date));
}

export async function uploadAsset(file) {
  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    pdf: "application/pdf",
  };
  const extension = file.name.split(".").pop().toLowerCase();
  if (
    !mimeTypes[extension] ||
    file.size === 0 ||
    file.size > 10 * 1024 * 1024
  ) {
    throw new Error(
      "Choose a non-empty JPG, PNG, WebP or PDF no larger than 10 MB.",
    );
  }
  const intent = await request("uploads/intent/", {
    method: "POST",
    authenticated: true,
    body: {
      name: file.name,
      size: file.size,
      content_type: mimeTypes[extension],
    },
  });
  if (intent.mode === "local") {
    const body = new FormData();
    body.append("file", file);
    return request("assets/", { method: "POST", body, authenticated: true });
  }
  if (intent.mode !== "direct")
    throw new Error("The server returned an unsupported upload configuration.");
  let response;
  try {
    // Do not send the staff token to object storage.
    response = await fetch(intent.url, {
      method: "PUT",
      headers: intent.headers,
      body: file,
      credentials: "omit",
    });
  } catch {
    throw new Error(
      "Unable to upload the file. Check your connection or the storage CORS settings.",
    );
  }
  if (!response.ok) throw new Error("File upload failed. Please try again.");
  return request("uploads/complete/", {
    method: "POST",
    authenticated: true,
    body: { intent: intent.intent },
  });
}
