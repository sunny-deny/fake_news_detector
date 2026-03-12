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
    <section>
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder="Paste a news headline or article text here..."
          rows={6}
          className="w-full resize-none rounded-xl border border-border bg-card px-5 py-4 pr-36 text-sm leading-relaxed text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim() || isLoading}
          className="absolute bottom-3 right-3 flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:scale-[1.03] hover:opacity-95 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 glow-primary"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Analyze
            </>
          )}
        </button>
      </div>
    </section>
  );
}