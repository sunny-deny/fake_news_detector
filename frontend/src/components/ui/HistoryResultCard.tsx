import { useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import ResultCard from "@/components/ui/ResultCard";
import { AnalysisResult } from "@/features/analysis/types";
import { formatTimestamp } from "@/utils/formatTimestamp";

const labelConfig = {
  "Likely Real": {
    icon: CheckCircle2,
    badgeClass: "text-success",
  },
  "Likely Fake": {
    icon: XCircle,
    badgeClass: "text-danger",
  },
  Uncertain: {
    icon: AlertTriangle,
    badgeClass: "text-warning",
  },
};

interface HistoryResultCardProps {
  result: AnalysisResult;
}

export default function HistoryResultCard({ result }: HistoryResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = labelConfig[result.label];
  const Icon = config.icon;

  if (isExpanded) {
    return (
      <div onClick={() => setIsExpanded(false)} className="cursor-pointer">
        <ResultCard result={result} onThumbClick={(e) => e.stopPropagation()} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsExpanded(true)}
      className="group w-full overflow-hidden rounded-2xl border border-border/60 bg-card/80 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
            <Icon className={`h-5 w-5 ${config.badgeClass}`} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {result.text}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span
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
              <span>•</span>
              <span>{result.score}%</span>
            </div>
          </div>
        </div>
        <div className="pointer-events-none flex w-[120px] shrink-0 items-center justify-end">
          <span
            className={`text-sm font-semibold uppercase tracking-wide transition-all duration-300 opacity-0 translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 ${config.badgeClass}`}
          >
            {result.label}
          </span>
        </div>
      </div>
    </button>
  );
}
