import { useState } from "react";
import PageShell from "@/components/layout/PageShell";
import MagnifierSearch from "@/components/hero/MagnifierSearch";
import AnalyzeForm from "@/components/ui/AnalyzeForm";
import ResultCard from "@/components/ui/ResultCard";
import { analyzeText } from "@/features/analysis/store";
import { AnalysisResult } from "@/features/analysis/types";

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
    <PageShell className="flex flex-1 flex-col items-center justify-start px-6 pb-16 pt-14">
      <div className="w-full max-w-5xl space-y-10">
        
        <section className="space-y-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-center">
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
{!result && !loading && (
          <section className="flex w-full justify-center">
            <div className="w-full max-w-4xl flex justify-center">
              <div className="h-[320px] w-full flex items-center justify-center">
                <MagnifierSearch />
              </div>
            </div>
          </section>
        )}
        <section className="mx-auto w-full max-w-2xl">
          <AnalyzeForm
            value={text}
            isLoading={loading}
            onChange={setText}
            onSubmit={handleAnalyze}
          />
        </section>

        {result && (
          <section className="mx-auto w-full max-w-2xl">
            <ResultCard result={result} />
          </section>
        )}
      </div>
    </PageShell>
  );
}