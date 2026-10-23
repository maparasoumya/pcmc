import { createContext, useContext } from "react";
export const SiteContext = createContext({
  data: [],
  loading: true,
  error: "",
});
export const useSite = () => useContext(SiteContext);
