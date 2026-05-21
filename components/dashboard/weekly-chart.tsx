import { cn } from "@/lib/utils";

interface WeeklyChartProps {
  data: { day: string; count: number; today?: boolean }[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div className="flex h-40 items-end gap-3 px-2 pt-2">
      {data.map((d, i) => {
        const heightPct = max === 0 ? 0 : (d.count / max) * 100;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-full w-full items-end">
              <div
                className={cn(
                  "w-full rounded-t-[3px] transition-all",
                  d.today ? "bg-emerald-600" : "bg-navy-700/85"
                )}
                style={{ height: `${heightPct}%` }}
                title={`${d.day}: ${d.count} ta hujjat`}
              />
            </div>
            <div
              className={cn(
                "font-mono text-[10px] text-ink-500",
                d.today && "text-ink-900 font-semibold"
              )}
            >
              {d.day}
            </div>
          </div>
        );
      })}
    </div>
  );
}
