import ReviewCard from "./ReviewCard";
import type { BadgeLevel, Finding } from "./ReviewCard";

interface SectionResult {
  badge: BadgeLevel;
  findings: Finding[];
}

export interface ReviewResult {
  quality: SectionResult;
  security: SectionResult;
  compliance: SectionResult;
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

const SEVERITY_ORDER: BadgeLevel[] = ["critical", "high", "medium", "low", "pass"];
const SEVERITY_COLORS: Record<string, string> = {
  critical: "text-red-600",
  high: "text-orange-500",
  medium: "text-yellow-600",
  low: "text-blue-500",
  pass: "text-badge-pass",
};

function highestSeverity(findings: Finding[]): BadgeLevel {
  for (const level of SEVERITY_ORDER) {
    if (findings.some((f) => f.severity === level)) return level;
  }
  return "pass";
}

function normalizeSectionResult(section: any): SectionResult {
  if (!section) return { badge: "pass", findings: [] };
  const findings: Finding[] = (section.findings || []).map((f: any) =>
    typeof f === "string"
      ? { severity: section.badge || "medium", context: undefined, confidence: undefined, text: f }
      : {
          severity: f.severity || "medium",
          context: f.context || undefined,
          confidence: f.confidence || undefined,
          text: f.text || "",
        }
  );
  const badge = highestSeverity(findings);
  return { badge, findings };
}

const ResultsPanel = ({ result, isLoading, error }: ResultsPanelProps) => {
  if (isLoading) return <LoadingState />;
  if (error)
    return (
      <div className="flex items-center justify-center h-full py-16">
        <p className="text-sm text-destructive font-medium">{error}</p>
      </div>
    );
  if (!result) return <EmptyState />;

  const quality = normalizeSectionResult(result.quality);
  const security = normalizeSectionResult(result.security);
  const compliance = normalizeSectionResult(result.compliance);

  const allFindings = [...quality.findings, ...security.findings, ...compliance.findings];
  const counts: Record<string, number> = {};
  for (const f of allFindings) {
    counts[f.severity] = (counts[f.severity] || 0) + 1;
  }

  const hasNeedsReview = allFindings.some((f) => f.confidence === "needs_review");

  return (
    <div className="flex flex-col gap-4 h-full">
      <p className="text-[11px] text-muted-foreground">
        🛡 <span className="font-medium">Kiteworks</span> = Security-company specific · <span className="font-medium">General</span> = Standard best practice
      </p>

      <div className="flex-1 flex flex-col gap-3">
        <ReviewCard title="Code Quality" badge={quality.badge} findings={quality.findings} delay={0} />
        <ReviewCard title="Security Analysis" badge={security.badge} findings={security.findings} delay={80} />
        <ReviewCard title="Compliance Check" badge={compliance.badge} findings={compliance.findings} delay={160} />
      </div>

      <div className="border-t border-border pt-4 space-y-1.5">
        <p className="text-sm font-semibold text-foreground flex items-center gap-3 flex-wrap">
          {SEVERITY_ORDER.filter((l) => l !== "pass" && counts[l]).map((level) => (
            <span key={level} className={SEVERITY_COLORS[level]}>
              {counts[level]} {level.charAt(0).toUpperCase() + level.slice(1)}
            </span>
          ))}
          {counts["pass"] && (
            <span className={SEVERITY_COLORS["pass"]}>{counts["pass"]} Passed</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          CodeGuard AI runs entirely within your secure perimeter. No code leaves your infrastructure.
        </p>
        {hasNeedsReview && (
          <p className="text-[11px] text-muted-foreground italic">
            Findings marked 'Needs review' may depend on context outside this code snippet. A senior engineer should validate before acting.
          </p>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;
