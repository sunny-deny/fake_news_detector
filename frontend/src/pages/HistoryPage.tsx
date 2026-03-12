import { Clock, Inbox } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import ResultCard from "@/components/ui/ResultCard";
import { AnalysisResult } from "@/features/analysis/types";

const mockHistory: AnalysisResult[] = [
  {
    id: "1",
    label: "Likely Fake",
    score: 92,
    text: "Breaking: miracle cure discovered overnight with zero side effects.",
    timestamp: new Date(),
    feedback: null,
  },
  {
    id: "2",
    label: "Likely Real",
    score: 84,
    text: "City council approves new public transit expansion after final review.",
    timestamp: new Date(),
    feedback: null,
  },
];

export default function HistoryPage() {
  return (
    <PageShell className="mx-auto w-full max-w-3xl px-6 py-12">
      <section className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Clock className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">Analysis History</h1>
          <p className="text-sm text-muted-foreground">{mockHistory.length} saved results</p>
        </div>
      </section>

      {mockHistory.length === 0 ? (
        <section className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No analyses yet.</p>
        </section>
      ) : (
        <section className="space-y-4">
          {mockHistory.map((item) => (
            <ResultCard key={item.id} result={item} />
          ))}
        </section>
      )}
    </PageShell>
  );
}