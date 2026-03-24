import { AnalysisResult, FeedbackValue } from "../types";
import { AnalyzeResponseDto, HistoryItemDto } from "./analysis.types";

function mapLabel(labelText: "FAKE" | "REAL"): AnalysisResult["label"] {
  return labelText === "REAL" ? "Likely Real" : "Likely Fake";
}

function mapConfidenceScore(scoreRealClass: number, labelText: "FAKE" | "REAL"): number {
  const predictedConfidence =
    labelText === "REAL" ? scoreRealClass : 1 - scoreRealClass;

  return Math.round(predictedConfidence * 1000) / 10;
}

function mapFeedback(
  userFeedback?: "correct" | "incorrect" | null,
): FeedbackValue | undefined {
  if (userFeedback === "correct") return "up";
  if (userFeedback === "incorrect") return "down";
  return undefined;
}

export function mapAnalyzeResponseToResult(dto: AnalyzeResponseDto, sourceText: string): AnalysisResult {
  return {
    id: String(dto.id),
    text: sourceText,
    label: mapLabel(dto.label_text),
    score: mapConfidenceScore(dto.score, dto.label_text),
    timestamp: new Date(dto.created_at),
    feedback: undefined,
  };
}

export function mapHistoryItemToResult(dto: HistoryItemDto): AnalysisResult {
  return {
    id: String(dto.id),
    text: dto.text,
    label: mapLabel(dto.label_text),
    score: mapConfidenceScore(dto.score, dto.label_text),
    timestamp: new Date(dto.created_at),
    feedback: mapFeedback(dto.user_feedback),
  };
}