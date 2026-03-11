import { useState } from "react";
import { Loader2, Search, Sparkles } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import ResultCard from "@/components/ResultCard";
import { AnalysisResult, analyzeText } from "@/lib/store";

export default function HomePage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim() || loading) return;

    setLoading(true);
    setResult(null);

    const analysisResult = await analyzeText(text.trim());

    setResult(analysisResult);
    setLoading(false);
  };

  return (
    <PageShell className="flex flex-1 flex-col items-center justify-start px-6 pb-16 pt-20">
      <div className="w-full max-w-2xl space-y-8">
        <section className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Analysis
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            Detect fake news
            <br />
            <span className="text-primary">before it spreads</span>
          </h1>

          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            Paste any headline or article text and our AI will analyze its credibility in seconds.
          </p>
        </section>

        <section className="space-y-4">
          <div className="relative">
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste a news headline or article text here..."
              rows={4}
              className="w-full resize-none rounded-xl border border-border bg-card px-5 py-4 text-sm leading-relaxed text-foreground transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!text.trim() || loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 glow-primary"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Analyze Text
              </>
            )}
          </button>
        </section>

        {result ? (
          <ResultCard result={result} />
        ) : !loading ? (
          <section className="space-y-3 py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Enter text above to get started</p>
          </section>
        ) : null}
      </div>
    </PageShell>
  );
}