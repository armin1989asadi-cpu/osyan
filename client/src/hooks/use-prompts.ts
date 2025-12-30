import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type GenerateInput } from "@shared/routes";

export function usePromptsHistory() {
  return useQuery({
    queryKey: [api.prompts.list.path],
    queryFn: async () => {
      const res = await fetch(api.prompts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("System Failure: Unable to retrieve prompt logs.");
      return api.prompts.list.responses[200].parse(await res.json());
    },
  });
}

export function useGeneratePrompt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: GenerateInput) => {
      // Intentional artificial delay for "processing" feel as per specs
      // Although UI will likely handle the visual delay, this ensures the mutation takes at least 600ms
      const minDelay = new Promise(resolve => setTimeout(resolve, 800));
      
      const fetchPromise = fetch(api.prompts.generate.path, {
        method: api.prompts.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const [res] = await Promise.all([fetchPromise, minDelay]);

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.prompts.generate.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("System Critical: Generation failed.");
      }
      return api.prompts.generate.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.prompts.list.path] });
    },
  });
}
