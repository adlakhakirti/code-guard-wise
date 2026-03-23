import ReviewCard from "./ReviewCard";
import type { BadgeLevel } from "./ReviewCard";

export interface ReviewResult {
  quality: { badge: BadgeLevel; findings: string[] };
  security: { badge: BadgeLevel; findings: string[] };
  compliance: { badge: BadgeLevel; findings: string[] };
}

interface ResultsPanelProps {
  result: ReviewResult | null;
  isLoading: boolean;
  error: string | null;
}

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-navy animate-pulse-dot"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}
    </div>
    <p className="text-sm font-medium text-muted-foreground">Analyzing code…</p>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-center">
    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
      <span className="text-xl">🛡️</span>
    </div>
    <p className="text-sm text-muted-foreground max-w-[260px]">
      Paste code or select an example to start a review
    </p>
  </div>
);

const ResultsPanel = ({ result, isLoading, error }: ResultsPanelProps) => {
  if (isLoading) return <LoadingState />;
  if (error)
    return (
      <div className="flex items-center justify-center h-full py-16">
        <p className="text-sm text-destructive font-medium">{error}</p>
      </div>
    );
  if (!result) return <EmptyState />;

  const counts = {
    critical: [result.quality, result.security, result.compliance].filter((s) => s.badge === "critical").length,
    warning: [result.quality, result.security, result.compliance].filter((s) => s.badge === "warning").length,
    pass: [result.quality, result.security, result.compliance].filter((s) => s.badge === "pass").length,
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex-1 flex flex-col gap-3">
        <ReviewCard title="Code Quality" badge={result.quality.badge} findings={result.quality.findings} delay={0} />
        <ReviewCard title="Security Analysis" badge={result.security.badge} findings={result.security.findings} delay={80} />
        <ReviewCard title="Compliance Check" badge={result.compliance.badge} findings={result.compliance.findings} delay={160} />
      </div>

      <div className="border-t border-border pt-4 space-y-1.5">
        <p className="text-sm font-semibold text-foreground flex items-center gap-3">
          {counts.critical > 0 && (
            <span className="text-badge-critical">{counts.critical} Critical</span>
          )}
          {counts.warning > 0 && (
            <span className="text-badge-warning">{counts.warning} Warning{counts.warning > 1 ? "s" : ""}</span>
          )}
          {counts.pass > 0 && (
            <span className="text-badge-pass">{counts.pass} Passed</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          CodeGuard AI runs entirely within your secure perimeter. No code leaves your infrastructure.
        </p>
      </div>
    </div>
  );
};

export default ResultsPanel;
