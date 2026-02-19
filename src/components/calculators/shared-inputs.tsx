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
  suffix?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  helperText?: string;
  error?: string;
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
  suffix,
  placeholder = "0",
  min,
  max,
  helperText,
  error,
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
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
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
          value={Number.isFinite(value) ? formatCOP(value) : ""}
          onChange={handleChange}
          placeholder={placeholder}
          className={clsx(
            "h-12 w-full rounded border border-border bg-card pl-8 text-sm outline-none transition-colors duration-200 focus:border-foreground focus:ring-2 focus:ring-foreground/20",
            suffix ? "pr-14" : "pr-3",
            error && "border-destructive focus:ring-destructive/20",
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/70">
            {suffix}
          </span>
        )}
      </div>
      {helperText && !error && <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
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
  helperText?: string;
}

export function NumberInput({
  id,
  label,
  value,
  onChange,
  min,
  max,
  placeholder = "0",
  helperText,
}: NumberInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
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
        className="h-12 w-full rounded border border-border bg-card px-3 text-sm outline-none transition-colors duration-200 focus:border-foreground focus:ring-2 focus:ring-foreground/20"
      />
      {helperText && <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>}
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
  helperText?: string;
}

export function SelectInput({ id, label, value, onChange, options, helperText }: SelectInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded border border-border bg-card px-3 text-sm outline-none transition-colors duration-200 focus:border-foreground focus:ring-2 focus:ring-foreground/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {helperText && <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}

/* ── ToggleInput ── */
interface ToggleInputProps {
  label: string;
  pressed: boolean;
  onToggle: (v: boolean) => void;
  helperText?: string;
}

export function ToggleInput({ label, pressed, onToggle, helperText }: ToggleInputProps) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(!pressed)}
        aria-pressed={pressed}
        className={clsx(
          "h-12 rounded border px-3 text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none",
          pressed
            ? "border-foreground bg-foreground/5 text-foreground"
            : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
        )}
      >
        {label}
      </button>
      {helperText && <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}

/* ── SliderInput ── */
interface SliderInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  helperText?: string;
}

export function SliderInput({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  helperText,
}: SliderInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded bg-muted"
      />
      {helperText && <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}
