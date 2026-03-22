import { apiFetch } from "@/lib/api/client";
import {
  AnalyzeResponseDto,
  FeedbackRequestDto,
  FeedbackResponseDto,
  HistoryResponseDto,
} from "./analysis.types";

export async function analyzeNews(text: string): Promise<AnalyzeResponseDto> {
  return apiFetch<AnalyzeResponseDto>("/analyze", {
    method: "POST",
    bodyJson: { text },
  });
}

export async function fetchHistory(page: number, limit: number): Promise<HistoryResponseDto> {
  return apiFetch<HistoryResponseDto>(`/history?page=${page}&limit=${limit}`);
}

export async function submitFeedback(payload: FeedbackRequestDto): Promise<FeedbackResponseDto> {
  return apiFetch<FeedbackResponseDto>("/feedback", {
    method: "POST",
    bodyJson: payload,
  });
}
