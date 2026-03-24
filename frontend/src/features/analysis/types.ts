export type AnalysisLabel = "Likely Real" | "Likely Fake" | "Uncertain";
export type FeedbackValue = "up" | "down";

export interface AnalysisResult {
  id: string;
  text: string;
  label: AnalysisLabel;
  score: number; 
  timestamp: Date;
  feedback?: FeedbackValue;
}