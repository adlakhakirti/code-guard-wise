import { CheckCircle, AlertTriangle, XCircle, AlertOctagon, Info } from "lucide-react";

export type BadgeLevel = "critical" | "high" | "medium" | "low" | "pass";

interface ReviewCardProps {
  title: string;
  badge: BadgeLevel;
  findings: { severity: BadgeLevel; text: string }[];
  delay?: number;
}

const BADGE_CONFIG: Record<BadgeLevel, { label: string; classes: string; icon: React.ElementType }> = {
  critical: { label: "Critical", classes: "bg-red-600 text-white", icon: XCircle },
  high: { label: "High", classes: "bg-orange-500 text-white", icon: AlertOctagon },
  medium: { label: "Medium", classes: "bg-yellow-500 text-gray-900", icon: AlertTriangle },
  low: { label: "Low", classes: "bg-blue-500 text-white", icon: Info },
  pass: { label: "Pass", classes: "bg-badge-pass text-white", icon: CheckCircle },
};

const SEVERITY_DOT: Record<BadgeLevel, string> = {
  critical: "bg-red-600",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
  pass: "bg-badge-pass",
};

const ReviewCard = ({ title, badge, findings, delay = 0 }: ReviewCardProps) => {
  const cfg = BADGE_CONFIG[badge];
  const Icon = cfg.icon;

  return (
    <div
      className="animate-fade-up bg-card rounded-lg shadow-sm shadow-black/[0.04] border border-border/60 p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-bold text-navy">{title}</h3>
        <span className={`${cfg.classes} text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 shrink-0`}>
          <Icon className="w-3 h-3" />
          {cfg.label}
        </span>
      </div>
      <ul className="space-y-2">
        {findings.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground/85 leading-snug">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[f.severity] || "bg-muted-foreground/40"} shrink-0`} />
            {f.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewCard;
