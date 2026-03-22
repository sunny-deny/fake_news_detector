import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitFeedback } from "../api/analysis.api";

export function useFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, feedback }: { id: string; feedback: "up" | "down" }) => {
      return submitFeedback({
        analysis_id: Number(id),
        feedback_type: feedback === "up" ? "correct" : "incorrect",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analysis-history"] });
    },
  });
}