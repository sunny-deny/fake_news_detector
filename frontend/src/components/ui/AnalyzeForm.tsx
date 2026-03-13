import { ChangeEvent, KeyboardEvent, useState } from "react";
import { Loader2, Search } from "lucide-react";

interface AnalyzeFormProps {
  value: string;
  isLoading?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const MIN_TEXT_LENGTH = 10;

export default function AnalyzeForm({
  value,
  isLoading = false,
  onChange,
  onSubmit,
}: AnalyzeFormProps) {
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  const handleSubmit = () => {
    setHasTriedSubmit(true);

    if (trimmedValue.length < MIN_TEXT_LENGTH || isLoading) {
      return;
    }

    onSubmit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  const trimmedValue = value.trim();
  const currentLength = trimmedValue.length;
  const isInvalid = hasTriedSubmit && currentLength < MIN_TEXT_LENGTH;
  const isDisabled = isLoading;
  const isActive = isFocused || value.length > 0;

  return (
    <section className="space-y-3">
      <div
        className={`rounded-2xl border bg-card transition-all duration-200 ${
          isInvalid
            ? "border-danger/50 shadow-[0_0_0_1px_rgba(239,68,68,0.25),0_0_24px_rgba(239,68,68,0.16)]"
            : isActive
              ? "border-primary/40 shadow-[0_0_0_1px_rgba(239,68,68,0.20),0_0_28px_rgba(239,68,68,0.18)]"
              : "border-border shadow-sm"
        }`}
      >
        <textarea
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Paste a news headline or article text here..."
          rows={6}
          className="w-full resize-none rounded-t-2xl bg-transparent px-5 py-4 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
        />

        <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3">
          <span className="text-xs text-muted-foreground">
            {currentLength} characters
          </span>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isDisabled}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 glow-primary"
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
      </div>

      {isInvalid && (
        <p className="px-1 text-sm text-danger">
          Please enter at least {MIN_TEXT_LENGTH} characters before analyzing.
        </p>
      )}
    </section>
  );
}
