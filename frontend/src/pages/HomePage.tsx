import { useEffect, useState } from "react";
import PageShell from "@/components/layout/PageShell";
import MagnifierSearch from "@/components/hero/MagnifierSearch";
import AnalyzeForm from "@/components/ui/AnalyzeForm";
import ResultCard from "@/components/ui/ResultCard";
import { AnalysisResult } from "@/features/analysis/types";
import { useAnalysis } from "@/features/analysis/hooks/useAnalysis";

const MIN_TEXT_LENGTH = 10;
const HERO_DISMISSED_STORAGE_KEY = "truthlens.heroDismissed";

export default function HomePage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [hasDismissedHero, setHasDismissedHero] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const analysisMutation = useAnalysis();
  const loading = analysisMutation.isPending;
  const errorMessage =
    analysisMutation.error instanceof Error
      ? analysisMutation.error.message
      : null;

  useEffect(() => {
    const savedValue = window.localStorage.getItem(HERO_DISMISSED_STORAGE_KEY);
    setHasDismissedHero(savedValue === "true");
    setIsReady(true);
  }, []);

  const handleStart = () => {
    setHasDismissedHero(true);
    window.localStorage.setItem(HERO_DISMISSED_STORAGE_KEY, "true");
  };

  const handleAnalyze = async () => {
    const cleanText = text.trim();

    if (cleanText.length < MIN_TEXT_LENGTH || loading) {
      return;
    }

    if (!hasDismissedHero) {
      setHasDismissedHero(true);
      window.localStorage.setItem(HERO_DISMISSED_STORAGE_KEY, "true");
    }

    setResult(null);

    try {
      const analysisResult = await analysisMutation.mutateAsync(cleanText);
      setResult(analysisResult);
    } catch {
      // handled by mutation error state
    }
  };

  if (!isReady) {
    return (
      <PageShell className="flex flex-1 flex-col items-center px-6 pb-16 pt-14">
        <div className="w-full max-w-5xl space-y-10">
          <section className="space-y-4 text-center">
            <h1 className="text-center text-5xl font-bold tracking-tight">
              Detect{" "}
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Fake News
              </span>{" "}
              Instantly
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Paste any headline or article text and analyze its credibility in seconds.
            </p>
          </section>
        </div>
      </PageShell>
    );
  }

  const showHero = !hasDismissedHero;
  const showForm = hasDismissedHero;

  return (
    <PageShell className="flex flex-1 flex-col items-center px-6 pb-16 pt-14">
      <div className="w-full max-w-5xl space-y-10">
        <section className="space-y-4 text-center">
          <h1 className="text-center text-5xl font-bold tracking-tight">
            Detect{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Fake News
            </span>{" "}
            Instantly
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Paste any headline or article text and analyze its credibility in seconds.
          </p>
        </section>

        <div
          className={`overflow-hidden transition-all duration-500 ${
            showHero ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <section className="flex w-full flex-col items-center justify-center gap-8">
            <div className="flex w-full max-w-4xl justify-center">
              <div className="flex h-[370px] w-full items-center justify-center">
                <MagnifierSearch />
              </div>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="glow-primary rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
            >
              Get Started
            </button>
          </section>
        </div>

        <div
          className={`overflow-hidden transition-all duration-500 ${
            showForm ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <section className="mx-auto w-full max-w-2xl space-y-4 pt-2">
            <AnalyzeForm
              value={text}
              isLoading={loading}
              onChange={setText}
              onSubmit={handleAnalyze}
            />

            {errorMessage && (
              <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                {errorMessage}
              </div>
            )}
          </section>
        </div>

        {result && (
          <section className="mx-auto w-full max-w-2xl">
            <ResultCard result={result} />
          </section>
        )}
      </div>
    </PageShell>
  );
}
