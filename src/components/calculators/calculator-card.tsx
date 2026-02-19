import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface CalculatorCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  articles: string[];
}

export function CalculatorCard({ href, title, description, icon: Icon, articles }: CalculatorCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-lg border border-transparent bg-card p-6 shadow-sm transition-all duration-300 hover:border-border hover:shadow"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-foreground/70" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground/70">
          {articles.map((a) => `Art. ${a}`).join(" · ")}
        </span>
        <span className="text-[11px] font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
          Abrir →
        </span>
      </div>
    </Link>
  );
}
