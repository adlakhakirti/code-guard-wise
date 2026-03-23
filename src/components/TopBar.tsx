import { Shield } from "lucide-react";

interface TopBarProps {
  securityAware: boolean;
  onToggle: (value: boolean) => void;
}

const TopBar = ({ securityAware, onToggle }: TopBarProps) => {
  return (
    <header className="bg-navy text-navy-foreground px-6 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5 shrink-0">
        <Shield className="w-6 h-6" strokeWidth={2.2} />
        <span className="font-bold text-lg tracking-tight">CodeGuard AI</span>
      </div>

      <p className="hidden md:block text-sm font-medium text-navy-foreground/80 text-center">
        Security-Aware Code Review for Engineering Teams
      </p>

      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-semibold transition-opacity ${!securityAware ? "opacity-100" : "opacity-50"}`}>
          Generic
        </span>
        <button
          onClick={() => onToggle(!securityAware)}
          className="relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-foreground/50"
          style={{ backgroundColor: securityAware ? "hsl(150 47% 33%)" : "hsl(210 10% 50%)" }}
          aria-label="Toggle review mode"
        >
          <span
            className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
            style={{ transform: securityAware ? "translateX(20px)" : "translateX(0)" }}
          />
        </button>
        <span className={`text-xs font-semibold transition-opacity ${securityAware ? "opacity-100" : "opacity-50"}`}>
          Security-Aware
        </span>
      </div>
    </header>
  );
};

export default TopBar;
