export interface AnalyzeRequestDto {
  text: string;
}

export interface AnalyzeResponseDto {
  id: number;
  label: number;
  label_text: "FAKE" | "REAL";
  score: number; // probability of REAL class (0-1)
  confidence: "High" | "Medium" | "Low";
  model_dir: string;
  created_at: string;
}

export interface HistoryItemDto {
  id: number;
  text: string;
  label_text: "FAKE" | "REAL";
  score: number; // probability of REAL class (0-1)
  confidence: "High" | "Medium" | "Low";
  created_at: string;
  user_feedback?: "correct" | "incorrect" | null;
}

export interface HistoryResponseDto {
  total: number;
  items: HistoryItemDto[];
}

export interface FeedbackRequestDto {
  analysis_id: number;
  feedback_type: "correct" | "incorrect";
  comment?: string;
}

export interface FeedbackResponseDto {
  message: string;
  feedback_id: number;
}