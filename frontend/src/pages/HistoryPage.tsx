import { useEffect, useState } from "react";
import { Clock, Inbox } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import HistoryResultCard from "@/components/ui/HistoryResultCard";
import { AnalysisResult } from "@/features/analysis/types";
import { getHistory, subscribe } from "@/features/analysis/store";

export default function HistoryPage() {
  const [history, setHistory] = useState<AnalysisResult[]>(getHistory());

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setHistory([...getHistory()]);
    });

    setHistory([...getHistory()]);

    return unsubscribe;
  }, []);

  return (
    <PageShell className="mx-auto w-full max-w-4xl px-6 py-12">
      <section className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Clock className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">Analysis History</h1>
          <p className="text-sm text-muted-foreground">{history.length} saved results</p>
        </div>
      </section>

      {history.length === 0 ? (
        <section className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No analyses yet.</p>
        </section>
      ) : (
        <section className="space-y-4">
          {history.map((item) => (
            <HistoryResultCard key={item.id} result={item} />
          ))}
        </section>
      )}
    </PageShell>
  );
}