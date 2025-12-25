import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { insertEmployeeSchema, type InsertEmployee } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useEmployees() {
  return useQuery({
    queryKey: [api.employees.list.path],
    queryFn: async () => {
      const res = await fetch(api.employees.list.path);
      if (!res.ok) throw new Error("Failed to fetch employees");
      return api.employees.list.responses[200].parse(await res.json());
    },
  });
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: [api.employees.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.employees.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch employee");
      return api.employees.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertEmployee) => {
      const validated = insertEmployeeSchema.parse(data);
      const res = await apiRequest("POST", api.employees.create.path, validated);
      return api.employees.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.employees.list.path] });
    },
  });
}
