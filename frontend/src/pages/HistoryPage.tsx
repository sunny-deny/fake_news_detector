import { Clock, Inbox, Loader2 } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import HistoryResultCard from "@/components/ui/HistoryResultCard";
import { useHistory } from "@/features/analysis/hooks/useHistory";

export default function HistoryPage() {
  const { data, isLoading, isError, error } = useHistory();

  const history = data?.items ?? [];

  return (
    <PageShell className="mx-auto w-full max-w-4xl px-6 py-12">
      <section className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Clock className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">Analysis History</h1>
          <p className="text-sm text-muted-foreground">{data?.total ?? 0} saved results</p>
        </div>
      </section>

      {isLoading ? (
        <section className="py-20 text-center">
          <Loader2 className="mx-auto mb-4 h-7 w-7 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading history...</p>
        </section>
      ) : isError ? (
        <section className="py-20 text-center">
          <p className="text-danger">
            {error instanceof Error ? error.message : "Failed to load history."}
          </p>
        </section>
      ) : history.length === 0 ? (
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