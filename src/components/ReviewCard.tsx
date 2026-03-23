import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export type BadgeLevel = "pass" | "warning" | "critical";

interface ReviewCardProps {
  title: string;
  badge: BadgeLevel;
  findings: string[];
  delay?: number;
}

const BADGE_CONFIG: Record<BadgeLevel, { label: string; bg: string; icon: React.ElementType }> = {
  pass: { label: "Pass", bg: "bg-badge-pass", icon: CheckCircle },
  warning: { label: "Warning", bg: "bg-badge-warning", icon: AlertTriangle },
  critical: { label: "Critical", bg: "bg-badge-critical", icon: XCircle },
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
        <span className={`${cfg.bg} text-white text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 shrink-0`}>
          <Icon className="w-3 h-3" />
          {cfg.label}
        </span>
      </div>
      <ul className="space-y-2">
        {findings.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground/85 leading-snug">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewCard;
