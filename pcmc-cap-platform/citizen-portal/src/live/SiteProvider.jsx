import { useRemote } from "../../../shared/useRemote";
import { SiteContext } from "./siteContext";
export default function SiteProvider({ children }) {
  const remote = useRemote("publications/?kind=settings");
  return (
    <SiteContext.Provider
      value={{ ...remote, settings: remote.data[0]?.data || {} }}
    >
      {children}
    </SiteContext.Provider>
  );
}
