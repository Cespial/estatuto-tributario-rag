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
      className="group flex flex-col rounded-lg border border-border p-4 transition-all hover:border-primary/50 hover:shadow-sm"
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <p className="mb-4 flex-1 text-sm text-muted-foreground">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {articles.map((a) => `Art. ${a}`).join(" · ")}
        </span>
        <span className="text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Abrir →
        </span>
      </div>
    </Link>
  );
}
