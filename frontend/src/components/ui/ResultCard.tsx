import { ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { AnalysisResult } from "@/features/analysis/types";
import { useFeedback } from "@/features/analysis/hooks/useFeedback";
import { formatTimestamp } from "@/utils/formatTimestamp";

const labelConfig = {
  "Likely Real": {
    icon: CheckCircle2,
    colorClass: "text-success border-success/30 bg-success/5",
    barClass: "bg-success",
    glowClass: "glow-success",
  },
  "Likely Fake": {
    icon: XCircle,
    colorClass: "text-danger border-danger/30 bg-danger/5",
    barClass: "bg-danger",
    glowClass: "glow-danger",
  },
  Uncertain: {
    icon: AlertTriangle,
    colorClass: "text-warning border-warning/30 bg-warning/5",
    barClass: "bg-warning",
    glowClass: "",
  },
};

export default function ResultCard({ result }: { result: AnalysisResult }) {
  const config = labelConfig[result.label];
  const Icon = config.icon;
  const feedbackMutation = useFeedback();


  const [localFeedback, setLocalFeedback] = useState<"up" | "down" | null>(
    result.feedback ?? null
  );

  const handleFeedback = async (e: React.MouseEvent, feedback: "up" | "down") => {
    e.stopPropagation();
    if (feedbackMutation.isPending || localFeedback) return;
    try {
      await feedbackMutation.mutateAsync({ id: result.id, feedback });
      setLocalFeedback(feedback);
    } catch {

    }
  };

  return (
    <div
      className={`w-full rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 transition-all duration-300 ${config.glowClass}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${config.colorClass}`}>
          <Icon className="w-4 h-4 shrink-0" />
          {result.label}
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl font-bold font-mono text-foreground">{result.score}%</span>
          <p className="text-xs text-muted-foreground mt-0.5">confidence</p>
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${config.barClass}`}
          style={{ width: `${result.score}%` }}
        />
      </div>

      {/* Full text */}
      <p className="text-sm text-muted-foreground leading-relaxed break-words">
        "{result.text}"
      </p>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
        <span
          className="text-xs text-muted-foreground"
          title={result.timestamp.toLocaleString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        >
          {formatTimestamp(result.timestamp)}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-1">Helpful?</span>
          <button
            onClick={(e) => handleFeedback(e, "up")}
            disabled={feedbackMutation.isPending || !!localFeedback}
            className={`p-2 rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:scale-110 active:scale-95 ${
              localFeedback === "up"
                ? "bg-success/10 text-success"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleFeedback(e, "down")}
            disabled={feedbackMutation.isPending || !!localFeedback}
            className={`p-2 rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:scale-110 active:scale-95 ${
              localFeedback === "down"
                ? "bg-danger/10 text-danger"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
