import { Code, Database, FileKey, ShieldCheck } from "lucide-react";

const SNIPPETS = [
  {
    label: "Data Access Function",
    icon: Database,
    code: `def get_user_data(user_id):
    conn = db.connect("postgresql://admin:REDACTED@db")
    result = conn.execute(f"SELECT * FROM users WHERE id = {user_id}")
    return result.fetchall()`,
  },
  {
    label: "File Transfer Handler",
    icon: FileKey,
    code: `function transferFile(file, destination) {
    const data = fs.readFileSync(file);
    fetch(destination, {
        method: 'POST',
        body: data,
        headers: {'Content-Type': 'application/octet-stream'}
    });
}`,
  },
  {
    label: "Access Control Check",
    icon: ShieldCheck,
    code: `def check_permission(user, resource):
    if user.role == "admin":
        return True
    return user.id == resource.owner_id`,
  },
];

interface CodeInputPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const CodeInputPanel = ({ code, onCodeChange, onSubmit, isLoading }: CodeInputPanelProps) => {
  return (
    <div className="flex flex-col gap-4 h-full">
      <label className="text-sm font-semibold text-foreground">
        Paste your code or try an example
      </label>

      <div className="flex flex-wrap gap-2">
        {SNIPPETS.map((s) => (
          <button
            key={s.label}
            onClick={() => onCodeChange(s.code)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium
              hover:bg-secondary/70 active:scale-[0.97] transition-all duration-150"
          >
            <s.icon className="w-3.5 h-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        placeholder="Paste a function or code block..."
        className="flex-1 min-h-[260px] rounded-lg bg-code-bg text-code-text font-mono-code text-[13px] leading-relaxed
          p-4 resize-none border-0 focus:outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-code-text/30
          overflow-wrap-break-word"
        spellCheck={false}
      />

      <button
        onClick={onSubmit}
        disabled={!code.trim() || isLoading}
        className="w-full py-2.5 rounded-lg bg-navy text-navy-foreground font-semibold text-sm
          hover:bg-navy/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-150 flex items-center justify-center gap-2"
      >
        <Code className="w-4 h-4" />
        {isLoading ? "Analyzing..." : "Review Code"}
      </button>
    </div>
  );
};

export default CodeInputPanel;
