import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateRequestInput, type UpdateRequestStatusInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useRequests(filters?: { role?: string; userId?: number }) {
  return useQuery({
    queryKey: [api.requests.list.path, filters],
    queryFn: async () => {
      const url = filters 
        ? `${api.requests.list.path}?${new URLSearchParams(filters as Record<string, string>)}`
        : api.requests.list.path;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch requests");
      return api.requests.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateRequestInput) => {
      const res = await fetch(api.requests.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create request");
      }
      
      return api.requests.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.requests.list.path] });
      toast({
        title: "Заявка создана",
        description: "Материалы успешно заказаны.",
        variant: "default",
        className: "border-l-4 border-primary bg-background text-foreground"
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useUpdateRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<CreateRequestInput>) => {
      const url = buildUrl(api.requests.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update request");
      return api.requests.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.requests.list.path] });
      toast({
        title: "Обновлено",
        description: "Статус заявки успешно изменен.",
        className: "border-l-4 border-primary bg-background text-foreground"
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка обновления",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
