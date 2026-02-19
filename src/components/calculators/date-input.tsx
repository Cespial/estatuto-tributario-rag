"use client";

interface DateInputProps {
  id: string;
  label: string;
  value: string; // ISO format "YYYY-MM-DD"
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  helperText?: string;
}

export function DateInput({ id, label, value, onChange, min, max, helperText }: DateInputProps) {
  return (
    <div>
      <label htmlFor={id} className="text-xs uppercase tracking-[0.05em] font-medium text-muted-foreground mb-1.5 block">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded border border-border bg-card px-3 text-sm outline-none transition-colors duration-200 focus:border-foreground focus:ring-2 focus:ring-foreground/20"
      />
      {helperText && <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}
