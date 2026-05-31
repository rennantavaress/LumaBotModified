import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LogEntry, LogLevel } from "@/lib/types";
import { Input } from "@/components/ui";

const FILTERS: { id: LogLevel | "all"; label: string }[] = [
  { id: "all", label: "Tudo" },
  { id: "info", label: "Info" },
  { id: "warn", label: "Avisos" },
  { id: "error", label: "Erros" },
  { id: "success", label: "OK" },
];

const LEVEL_COLOR: Record<LogLevel, string> = {
  info: "text-accent",
  warn: "text-warn",
  error: "text-danger",
  success: "text-success",
};

export function Logs({ logs }: { logs: LogEntry[] }) {
  const [filter, setFilter] = useState<LogLevel | "all">("all");
  const [query, setQuery] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return logs.filter(
      (l) => (filter === "all" || l.level === filter) && (!q || l.message.toLowerCase().includes(q))
    );
  }, [logs, filter, query]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filtered.length]);

  return (
    <div className="animate-fade-up space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Logs</h1>
        <p className="text-sm text-fg-soft">Saída do bot em tempo real.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f.id ? "bg-primary/15 text-primary" : "text-fg-soft hover:bg-elevated"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Buscar…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="h-[calc(100vh-280px)] min-h-[320px] overflow-y-auto rounded-lg border border-border bg-bg/60 p-4 font-mono text-xs leading-relaxed">
        {filtered.length === 0 ? (
          <div className="grid h-full place-items-center text-muted">Sem logs.</div>
        ) : (
          filtered.map((l, i) => (
            <div key={i} className="flex gap-3 py-0.5">
              <span className="shrink-0 text-muted">
                {new Date(l.timestamp).toLocaleTimeString("pt-BR")}
              </span>
              <span className={cn("shrink-0 uppercase", LEVEL_COLOR[l.level])}>{l.level.slice(0, 4)}</span>
              <span className="whitespace-pre-wrap break-words text-fg-soft">{l.message}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
