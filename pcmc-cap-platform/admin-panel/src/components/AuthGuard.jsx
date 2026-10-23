import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { request, token, clearAuth } from "../../../shared/api";
export default function AuthGuard() {
  const [state, setState] = useState(() => (token() ? "loading" : "denied")),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const expire = () => setState("denied");
    window.addEventListener("pcmc-auth-expired", expire);
    if (token())
      request("auth/me/", { authenticated: true })
        .then((user) => {
          if (active) {
            if (user.is_staff) setState("ready");
            else {
              clearAuth();
              setState("denied");
            }
          }
        })
        .catch((e) => {
          if (active) {
            setError(e.message);
            setState(token() ? "error" : "denied");
          }
        });
    return () => {
      active = false;
      window.removeEventListener("pcmc-auth-expired", expire);
    };
  }, [attempt]);
  if (state === "loading") return <p role="status">Checking staff access…</p>;
  if (state === "denied") return <Navigate to="/login" replace />;
  if (state === "error")
    return (
      <div role="alert">
        <p>{error}</p>
        <button
          onClick={() => {
            setState("loading");
            setAttempt((a) => a + 1);
          }}
        >
          Retry
        </button>
      </div>
    );
  return <Outlet />;
}
