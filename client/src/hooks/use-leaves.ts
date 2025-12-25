import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { insertLeaveRequestSchema, type InsertLeaveRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useLeaves() {
  return useQuery({
    queryKey: [api.leaves.list.path],
    queryFn: async () => {
      const res = await fetch(api.leaves.list.path);
      if (!res.ok) throw new Error("Failed to fetch leaves");
      return api.leaves.list.responses[200].parse(await res.json());
    },
  });
}

export function useApplyLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertLeaveRequest) => {
      const validated = insertLeaveRequestSchema.parse(data);
      const res = await apiRequest("POST", api.leaves.apply.path, validated);
      return api.leaves.apply.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.leaves.list.path] });
    },
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.leaves.approve.path, { id });
      const res = await apiRequest("POST", url);
      return api.leaves.approve.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.leaves.list.path] });
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.leaves.reject.path, { id });
      const res = await apiRequest("POST", url);
      return api.leaves.reject.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.leaves.list.path] });
    },
  });
}
