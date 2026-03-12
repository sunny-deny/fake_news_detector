import { ChangeEvent } from "react";
import { Loader2, Search } from "lucide-react";

interface AnalyzeFormProps {
  value: string;
  isLoading?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function AnalyzeForm({
  value,
  isLoading = false,
  onChange,
  onSubmit,
}: AnalyzeFormProps) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <section className="space-y-4">
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder="Paste a news headline or article text here..."
          rows={4}
          className="w-full resize-none rounded-xl border border-border bg-card px-5 py-4 text-sm leading-relaxed text-foreground transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!value.trim() || isLoading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 glow-primary"
      >
        {isLoading ? (
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
  );
}