import { useMutation, useQueryClient } from "@tanstack/react-query";
import { analyzeNews } from "../api/analysis.api";
import { mapAnalyzeResponseToResult } from "../api/analysis.mappers";
import { AnalysisResult } from "../types";

export function useAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (text: string): Promise<AnalysisResult> => {
      const dto = await analyzeNews(text);
      return mapAnalyzeResponseToResult(dto, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analysis-history"] });
    },
  });
}