import { useRemote } from "../../../shared/useRemote";
export function useSectors() {
  const remote = useRemote("publications/?kind=sectors");
  return {
    ...remote,
    sectors: remote.data.map((row) => ({
      ...row.data,
      id: row.slug,
      title: row.title,
      plannedActions: (row.data.plannedActions || "")
        .split("\n")
        .filter(Boolean),
      citizenActions: (row.data.citizenActions || "")
        .split("\n")
        .filter(Boolean),
    })),
  };
}
