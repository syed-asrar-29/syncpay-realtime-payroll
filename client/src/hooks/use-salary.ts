import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useSalaryRecords() {
  return useQuery({
    queryKey: [api.salary.list.path],
    queryFn: async () => {
      const res = await fetch(api.salary.list.path);
      if (!res.ok) throw new Error("Failed to fetch salary records");
      return api.salary.list.responses[200].parse(await res.json());
    },
  });
}
