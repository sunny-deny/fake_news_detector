import { Clock, Inbox } from "lucide-react";
import { useSyncExternalStore } from "react";
import PageShell from "@/components/layout/PageShell";
import ResultCard from "@/components/ResultCard";
import { getHistory, subscribe } from "@/lib/store";

export default function HistoryPage() {
  const history = useSyncExternalStore(subscribe, getHistory);

  return (
    <PageShell className="mx-auto w-full max-w-2xl px-6 py-12">
      <section className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
          <Clock className="h-5 w-5 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Analysis History</h1>
          <p className="text-sm text-muted-foreground">
            {history.length} {history.length === 1 ? "result" : "results"}
          </p>
        </div>
      </section>

      {history.length === 0 ? (
        <section className="space-y-4 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No analyses yet. Go analyze some text!</p>
        </section>
      ) : (
        <section className="space-y-4">
          {history.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </section>
      )}
    </PageShell>
  );
}