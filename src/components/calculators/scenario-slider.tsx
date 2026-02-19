"use client";

interface ScenarioSliderProps {
  label: string;
  helper?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

export function ScenarioSlider({
  label,
  helper,
  value,
  min,
  max,
  step = 100000,
  onChange,
  formatValue,
}: ScenarioSliderProps) {
  return (
    <div className="mb-6 rounded-lg border border-border/60 bg-card p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <span className="text-sm font-semibold text-foreground">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded bg-muted"
      />
      {helper && <p className="mt-2 text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}
