"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  CALCULATOR_CATEGORIES,
  CALCULATORS_BY_ID,
  CALCULATORS_CATALOG,
  type CalculatorCategory,
  TOP5_CALCULATORS,
} from "@/config/calculators-catalog";
import {
  GUIDED_STEPS,
  getGuidedRecommendation,
} from "@/config/calculators-guided-flow";
import { CalculatorCard } from "@/components/calculators/calculator-card";
import { CALCULATOR_ICON_MAP } from "@/components/calculators/calculator-icon-map";
import {
  getPopularCalculatorIds,
  trackCalculatorUsage,
} from "@/lib/calculators/popularity";
import { searchCalculators } from "@/lib/calculators/search";

const CATEGORY_LABELS: Record<CalculatorCategory, string> = {
  todas: "Todas",
  renta: "Renta",
  iva: "IVA",
  laboral: "Laboral",
  patrimonio: "Patrimonio",
  sanciones: "Sanciones",
  otros: "Otros",
};

const SEARCH_SUGGESTIONS = [
  "necesito calcular cuanto pago de renta",
  "quiero saber si debo declarar",
  "comparar contrato laboral vs servicios",
  "calcular nomina mensual",
];

const FALLBACK_ICON = CALCULATOR_ICON_MAP.Search;

export function CalculadorasHubClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CalculatorCategory>("todas");
  const popularIds = useMemo(
    () => getPopularCalculatorIds({ days: 7, limit: 5 }),
    [],
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of CALCULATORS_CATALOG) {
      counts[item.category] = (counts[item.category] ?? 0) + 1;
    }
    return counts;
  }, []);

  const searched = useMemo(() => {
    if (!query.trim()) {
      return CALCULATORS_CATALOG.map((item, index) => ({
        item,
        score: item.isTop5 ? 1000 - index : 100 - index,
        matches: [],
      }));
    }
    return searchCalculators(query, CALCULATORS_CATALOG);
  }, [query]);

  const filtered = useMemo(() => {
    const list = searched
      .filter((result) => category === "todas" || result.item.category === category)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));

    return list.map((result) => result.item);
  }, [searched, category]);

  const popularCalculators = useMemo(() => {
    const fromUsage = popularIds
      .map((id) => CALCULATORS_BY_ID[id])
      .filter(Boolean)
      .slice(0, 5);

    if (fromUsage.length > 0) return fromUsage;
    return TOP5_CALCULATORS.slice(0, 5);
  }, [popularIds]);

  const recommendation = useMemo(
    () =>
      getGuidedRecommendation({
        need: answers.need,
        profile: answers.profile,
        frequency: answers.frequency,
      }),
    [answers],
  );

  const recommendedPrimary = recommendation
    ? CALCULATORS_BY_ID[recommendation.primary]
    : null;
  const recommendedSecondary = recommendation
    ? recommendation.secondary.map((id) => CALCULATORS_BY_ID[id]).filter(Boolean)
    : [];

  return (
    <>
      <h1 className="mb-3 heading-serif text-3xl">Encuentra la calculadora tributaria que necesitas</h1>
      <p className="mb-8 text-base leading-relaxed text-muted-foreground">
        35 herramientas para personas naturales, contadores y empresas en Colombia.
      </p>

      <section className="mb-8 rounded-lg border border-border/60 bg-card p-5 shadow-sm">
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Ej: "necesito calcular cuanto pago de renta"'
            className="h-12 w-full rounded border border-border bg-card pl-9 pr-3 text-sm outline-none transition-colors focus:border-foreground focus:ring-2 focus:ring-foreground/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {SEARCH_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              className="rounded border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {CALCULATOR_CATEGORIES.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={`rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
                category === key
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {CATEGORY_LABELS[key]}
              {key !== "todas" ? ` (${categoryCounts[key] ?? 0})` : ` (${CALCULATORS_CATALOG.length})`}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="heading-serif text-2xl">Mas usadas esta semana</h2>
          <p className="text-xs text-muted-foreground">Se actualiza con uso real de tu navegador</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularCalculators.map((calc) => (
            <CalculatorCard
              key={`popular-${calc.id}`}
              href={calc.href}
              title={calc.title}
              description={calc.description}
              icon={CALCULATOR_ICON_MAP[calc.iconName] ?? FALLBACK_ICON}
              articles={calc.articles}
              category={CATEGORY_LABELS[calc.category]}
              badges={calc.badges}
              isPopular
              onOpen={() => trackCalculatorUsage(calc.id)}
            />
          ))}
        </div>
      </section>

      <section className="mb-10 rounded-lg border border-border/60 bg-card p-5 shadow-sm">
        <h2 className="mb-2 heading-serif text-2xl">No sabes cual usar? Te guiamos en 30 segundos</h2>
        <p className="mb-4 text-sm text-muted-foreground">Responde 3 preguntas y te recomendamos calculadoras.</p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {GUIDED_STEPS.map((step) => (
            <div key={step.id}>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
                {step.title}
              </label>
              <select
                value={answers[step.id] ?? ""}
                onChange={(event) => setAnswers((prev) => ({ ...prev, [step.id]: event.target.value }))}
                className="h-11 w-full rounded border border-border bg-card px-3 text-sm outline-none transition-colors focus:border-foreground focus:ring-2 focus:ring-foreground/20"
              >
                <option value="">Seleccionar</option>
                {step.choices.map((choice) => (
                  <option key={choice.id} value={choice.id}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {recommendedPrimary && (
          <div className="mt-5 rounded-lg border border-border/60 bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.05em] text-muted-foreground">Recomendacion principal</p>
            <Link
              href={recommendedPrimary.href}
              onClick={() => trackCalculatorUsage(recommendedPrimary.id)}
              className="mt-1 block text-base font-semibold text-foreground hover:underline"
            >
              {recommendedPrimary.title}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{recommendedPrimary.description}</p>

            {recommendedSecondary.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {recommendedSecondary.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => trackCalculatorUsage(item.id)}
                    className="rounded border border-border bg-card px-2.5 py-1 text-xs text-foreground hover:bg-muted"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="heading-serif text-2xl">Catalogo de calculadoras</h2>
          <p className="text-xs text-muted-foreground">
            {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((calc) => (
            <CalculatorCard
              key={calc.id}
              href={calc.href}
              title={calc.title}
              description={calc.description}
              icon={CALCULATOR_ICON_MAP[calc.iconName] ?? FALLBACK_ICON}
              articles={calc.articles}
              category={CATEGORY_LABELS[calc.category]}
              badges={calc.badges}
              isPopular={popularIds.includes(calc.id)}
              onOpen={() => trackCalculatorUsage(calc.id)}
            />
          ))}
        </div>
      </section>
    </>
  );
}
