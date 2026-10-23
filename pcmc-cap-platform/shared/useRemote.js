import { useEffect, useState, useCallback } from "react";
import { list } from "./api";
export function useRemote(path, authenticated = false) {
  const [state, setState] = useState({ data: [], loading: true, error: "" });
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    list(path, { signal: controller.signal, authenticated })
      .then((data) => setState({ data, loading: false, error: "" }))
      .catch((error) => {
        if (error.name !== "AbortError")
          setState({ data: [], loading: false, error: error.message });
      });
    return () => controller.abort();
  }, [path, version, authenticated]);
  return { ...state, reload };
}
