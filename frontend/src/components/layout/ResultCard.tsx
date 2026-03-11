import { ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { AnalysisResult, setFeedback } from "@/lib/store";

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

const ResultCard = ({ result }: { result: AnalysisResult }) => {
  const config = labelConfig[result.label];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border border-border bg-card p-6 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 ${config.glowClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${config.colorClass}`}>
          <Icon className="w-4 h-4" />
          {result.label}
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold font-mono text-foreground">{result.score}%</span>
          <p className="text-xs text-muted-foreground mt-0.5">confidence</p>
        </div>
      </div>

      <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${config.barClass}`}
          style={{ width: `${result.score}%` }}
        />
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
        "{result.text}"
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground font-mono">
          {result.timestamp.toLocaleString()}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-2">Helpful?</span>
          <button
            onClick={() => setFeedback(result.id, "up")}
            className={`p-2 rounded-lg transition-colors ${
              result.feedback === "up"
                ? "bg-success/10 text-success"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFeedback(result.id, "down")}
            className={`p-2 rounded-lg transition-colors ${
              result.feedback === "down"
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
};

export default ResultCard;
