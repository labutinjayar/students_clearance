import type { LucideIcon } from 'lucide-react';

export interface DashboardMetric {
  label: string;
  detail: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

interface DashboardMetricPanelProps {
  title: string;
  description: string;
  metrics: DashboardMetric[];
  columns?: 4 | 5;
}

export function DashboardMetricPanel({ title, description, metrics, columns = 4 }: DashboardMetricPanelProps) {
  const desktopColumns = columns === 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-4';

  return (
    <section className="rounded-3xl border-2 border-sky-200/80 bg-white/95 p-4 sm:p-5 shadow-xs backdrop-blur-xs">
      <div className="mb-4">
        <h2 className="font-black text-base text-sky-950">{title}</h2>
        <p className="text-xs text-sky-900/70 font-medium">{description}</p>
      </div>
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${desktopColumns} gap-2.5`}>
        {metrics.map((metric) => (
          <div key={metric.label} className="flex min-w-0 items-center gap-3 rounded-xl border border-sky-200 bg-sky-50/70 px-3 py-2.5">
            <metric.icon className={`w-4 h-4 shrink-0 ${metric.color}`} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-black text-sky-950">{metric.label}</div>
              <div className="truncate text-[10px] text-sky-800/80 font-medium">{metric.detail}</div>
            </div>
            <div className={`text-xl font-black ${metric.color}`}>{metric.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}