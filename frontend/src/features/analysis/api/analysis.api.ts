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

export async function fetchHistory(limit = 50, offset = 0): Promise<HistoryResponseDto> {
  return apiFetch<HistoryResponseDto>(`/history?limit=${limit}&offset=${offset}`);
}

export async function submitFeedback(payload: FeedbackRequestDto): Promise<FeedbackResponseDto> {
  return apiFetch<FeedbackResponseDto>("/feedback", {
    method: "POST",
    bodyJson: payload,
  });
}