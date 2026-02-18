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
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
