import { useQuery } from "@tanstack/react-query";
import { fetchHistory } from "../api/analysis.api";
import { mapHistoryItemToResult } from "../api/analysis.mappers";

export function useHistory(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["analysis-history", limit, offset],
    queryFn: async () => {
      const dto = await fetchHistory(limit, offset);
      return {
        total: dto.total,
        items: dto.items.map(mapHistoryItemToResult),
      };
    },
  });
}