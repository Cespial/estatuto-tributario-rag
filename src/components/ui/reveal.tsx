"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={className}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
