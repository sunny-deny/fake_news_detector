export interface AnalysisResult {
  id: string;
  text: string;
  label: "Likely Real" | "Likely Fake" | "Uncertain";
  score: number;
  timestamp: Date;
  feedback?: "up" | "down";
}