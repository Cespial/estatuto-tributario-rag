"use client";

interface DateInputProps {
  id: string;
  label: string;
  value: string; // ISO format "YYYY-MM-DD"
  onChange: (v: string) => void;
}

export function DateInput({ id, label, value, onChange }: DateInputProps) {
  return (
    <div>
      <label htmlFor={id} className="text-xs uppercase tracking-wide font-medium text-muted-foreground mb-1.5 block">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
      />
    </div>
  );
}
