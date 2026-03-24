import { useQuery } from "@tanstack/react-query";
import { fetchHistory } from "../api/analysis.api";
import { mapHistoryItemToResult } from "../api/analysis.mappers";

export function useHistory(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["analysis-history", page, limit],
    queryFn: async () => {
      const dto = await fetchHistory(page, limit);
      return {
        total: dto.total,
        page: dto.page,
        limit: dto.limit,
        totalPages: dto.total_pages,
        items: dto.items.map(mapHistoryItemToResult),
      };
    },
  });
}
