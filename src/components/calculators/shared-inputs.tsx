"use client";

import { useCallback, useRef } from "react";
import { clsx } from "clsx";

/* ── CurrencyInput ── */
interface CurrencyInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  placeholder?: string;
  min?: number;
  max?: number;
}

function formatCOP(n: number): string {
  if (!n && n !== 0) return "";
  return n.toLocaleString("es-CO");
}

function parseCOP(s: string): number {
  return Number(s.replace(/\./g, "").replace(/,/g, "")) || 0;
}

export function CurrencyInput({
  id,
  label,
  value,
  onChange,
  prefix = "$",
  placeholder = "0",
  min,
  max,
}: CurrencyInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseCOP(e.target.value);
      let clamped = raw;
      if (min !== undefined && clamped < min) clamped = min;
      if (max !== undefined && clamped > max) clamped = max;
      onChange(clamped);
    },
    [onChange, min, max],
  );

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/60">
          {prefix}
        </span>
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode="numeric"
          value={value ? formatCOP(value) : ""}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-8 pr-3 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/20"
        />
      </div>
    </div>
  );
}

/* ── NumberInput (sin formato moneda) ── */
interface NumberInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  placeholder?: string;
}

export function NumberInput({ id, label, value, onChange, min, max, placeholder = "0" }: NumberInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type="number"
        value={value || ""}
        onChange={(e) => {
          let v = Number(e.target.value) || 0;
          if (min !== undefined && v < min) v = min;
          if (max !== undefined && v > max) v = max;
          onChange(v);
        }}
        min={min}
        max={max}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/20"
      />
    </div>
  );
}

/* ── SelectInput ── */
interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
}

export function SelectInput({ id, label, value, onChange, options }: SelectInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-foreground focus-visible:ring-2 focus-visible:ring-foreground/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── ToggleInput ── */
interface ToggleInputProps {
  label: string;
  pressed: boolean;
  onToggle: (v: boolean) => void;
}

export function ToggleInput({ label, pressed, onToggle }: ToggleInputProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!pressed)}
      aria-pressed={pressed}
      className={clsx(
        "rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none",
        pressed
          ? "border-foreground bg-foreground/5 text-foreground"
          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
