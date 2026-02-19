import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface CalculatorCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  articles: string[];
  category?: string;
  badges?: string[];
  isPopular?: boolean;
  onOpen?: () => void;
}

export function CalculatorCard({
  href,
  title,
  description,
  icon: Icon,
  articles,
  category,
  badges = [],
  isPopular = false,
  onOpen,
}: CalculatorCardProps) {
  return (
    <Link
      href={href}
      onClick={onOpen}
      className="group flex flex-col rounded-lg border border-transparent bg-card p-6 shadow-sm transition-all duration-300 hover:border-border hover:shadow"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-foreground/70" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        {isPopular && (
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-foreground">
            Popular
          </span>
        )}
      </div>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      {badges.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.05em] text-muted-foreground"
            >
              {badge}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground/70">
          {category ? category.toUpperCase() : "OTROS"}
        </span>
        <span className="text-[11px] text-muted-foreground/70">
          {articles.length > 0 ? articles.map((a) => `Art. ${a}`).join(" · ") : "Sin articulo"}
        </span>
        <span className="text-[11px] font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
          Abrir →
        </span>
      </div>
    </Link>
  );
}
