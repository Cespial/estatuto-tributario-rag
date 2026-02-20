import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { clsx } from "clsx";
import type { EstadoVigenciaDoctrina } from "@/types/knowledge";

interface VigenciaBadgeProps {
  status: EstadoVigenciaDoctrina;
  className?: string;
}

const STATUS_CONFIG: Record<
  EstadoVigenciaDoctrina,
  { label: string; className: string; Icon: typeof CheckCircle2; tooltip: string }
> = {
  vigente: {
    label: "Vigente",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300",
    Icon: CheckCircle2,
    tooltip: "Vigente: norma en pleno vigor y aplicable actualmente.",
  },
  revocado: {
    label: "Revocado",
    className: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300",
    Icon: XCircle,
    tooltip: "Revocado: sustituida o invalidada por una norma o concepto posterior.",
  },
  suspendido: {
    label: "Suspendido",
    className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300",
    Icon: AlertTriangle,
    tooltip: "Suspendido: temporalmente sin efecto por decisión judicial o administrativa.",
  },
};

export function VigenciaBadge({ status, className }: VigenciaBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      title={config.tooltip}
      className={clsx(
        "group relative inline-flex cursor-help items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        config.className,
        className
      )}
    >
      <config.Icon className="h-3.5 w-3.5" />
      {config.label}
      
      {/* Visual Tooltip for better UI */}
      <span className="absolute bottom-full left-1/2 mb-2 hidden w-40 -translate-x-1/2 rounded bg-foreground px-2 py-1 text-[10px] text-background shadow-xl group-hover:block z-50">
        {config.tooltip}
        <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-foreground" />
      </span>
    </span>
  );
}
