import { readFile, readdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const DATA_DIR = path.join(ROOT, "public", "data");
const INDEX_PATH = path.join(DATA_DIR, "articles-index.json");
const DASHBOARD_STATS_PATH = path.join(DATA_DIR, "dashboard-stats.json");
const ARTICLES_DIR = path.join(DATA_DIR, "articles");

const OUT_ENRICHED_INDEX = path.join(DATA_DIR, "articles-index.enriched.json");
const OUT_EXPLORER_FACETS = path.join(DATA_DIR, "explorer-facets.json");
const OUT_FEATURED_ARTICLES = path.join(DATA_DIR, "featured-articles.json");
const OUT_DASHBOARD_TIMESERIES = path.join(DATA_DIR, "dashboard-timeseries.json");

function stripDiacritics(input) {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeForSearch(input) {
  return stripDiacritics(String(input || ""))
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(input) {
  return String(input || "").replace(/<[^>]*>/g, " ");
}

function compactWhitespace(input) {
  return String(input || "").replace(/\s+/g, " ").trim();
}

function firstSnippet(article, fallback = "") {
  const plain = compactWhitespace(
    article?.contenido_texto || stripHtml(article?.contenido_html || "")
  );
  if (!plain) return fallback;
  return plain.slice(0, 240);
}

function parseLawRef(input) {
  const raw = compactWhitespace(input);
  const match = raw.match(
    /\b(ley|decreto(?:\s+ley)?)\s+(\d+[A-Za-z-]*)\s+(?:de|del)\s+(\d{4})\b/i
  );

  if (!match) {
    return {
      tipo: "otra",
      numero: null,
      year: null,
      label: raw,
      key: normalizeForSearch(raw),
    };
  }

  const tipoRaw = normalizeForSearch(match[1]);
  const numero = String(match[2]);
  const year = Number(match[3]);

  const tipo =
    tipoRaw === "ley"
      ? "ley"
      : tipoRaw.includes("decreto ley")
      ? "decreto-ley"
      : "decreto";

  const label =
    tipo === "ley"
      ? `Ley ${numero} de ${year}`
      : tipo === "decreto-ley"
      ? `Decreto Ley ${numero} de ${year}`
      : `Decreto ${numero} de ${year}`;

  const key =
    tipo === "ley"
      ? `ley-${numero.toLowerCase()}-${year}`
      : tipo === "decreto-ley"
      ? `decreto-ley-${numero.toLowerCase()}-${year}`
      : `decreto-${numero.toLowerCase()}-${year}`;

  return { tipo, numero, year, label, key };
}

function toPct(partial, total) {
  if (!total) return 0;
  return Number(((partial / total) * 100).toFixed(1));
}

function buildFeaturedBadges(item, latestYear) {
  const badges = [];
  if (item.ultima_modificacion_year === latestYear) {
    badges.push(`Modificado ${latestYear}`);
  }
  if (item.has_derogado_text) badges.push("Con texto derogado");
  if (item.has_normas) badges.push("Con normas");
  if (item.total_mods >= 8) badges.push("Alta actividad legislativa");
  return badges.slice(0, 3);
}

function pickWithLibroDiversity(sorted, maxItems) {
  const output = [];
  const usedLibro = new Set();

  for (const item of sorted) {
    if (output.length >= maxItems) break;
    if (usedLibro.has(item.libro)) continue;
    output.push(item);
    usedLibro.add(item.libro);
  }

  for (const item of sorted) {
    if (output.length >= maxItems) break;
    if (output.some((x) => x.slug === item.slug)) continue;
    output.push(item);
  }

  return output;
}

function range(start, end) {
  const values = [];
  for (let year = start; year <= end; year += 1) values.push(year);
  return values;
}

async function loadJson(filePath) {
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

async function writeJson(filePath, payload) {
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
}

async function main() {
  const [index, dashboardStats] = await Promise.all([
    loadJson(INDEX_PATH),
    loadJson(DASHBOARD_STATS_PATH),
  ]);

  const articleFiles = (await readdir(ARTICLES_DIR)).filter((f) =>
    f.endsWith(".json")
  );

  const articlesBySlug = new Map();
  const articleReadTasks = articleFiles.map(async (fileName) => {
    const article = await loadJson(path.join(ARTICLES_DIR, fileName));
    articlesBySlug.set(article.slug, article);
  });
  await Promise.all(articleReadTasks);

  const slugSet = new Set(index.map((item) => item.slug));
  const generatedAt = new Date().toISOString();

  const libroCounts = new Map();
  const estadoCounts = new Map();
  const modYearCounts = new Map();
  const lawCounts = new Map();

  let hasModsCount = 0;
  let hasNormasCount = 0;
  let hasDerogadoTextCount = 0;
  let invalidCrossRefCount = 0;

  const enriched = index.map((item) => {
    const article = articlesBySlug.get(item.slug);
    const lawsRaw = Array.isArray(article?.leyes_modificatorias)
      ? article.leyes_modificatorias
      : [];
    const normalizedLawMap = new Map();
    for (const law of lawsRaw) {
      const parsed = parseLawRef(law);
      if (!parsed.key) continue;
      normalizedLawMap.set(parsed.key, parsed.label);
      const current = lawCounts.get(parsed.key) || { label: parsed.label, count: 0 };
      current.count += 1;
      lawCounts.set(parsed.key, current);
    }

    const crossReferences = Array.isArray(article?.cross_references)
      ? article.cross_references
      : [];
    const referencedBy = Array.isArray(article?.referenced_by)
      ? article.referenced_by
      : [];

    const crossRefsValid = crossReferences.filter((slug) => slugSet.has(slug));
    const crossRefsInvalid = crossReferences.length - crossRefsValid.length;
    const referencedByValid = referencedBy.filter((slug) => slugSet.has(slug));
    invalidCrossRefCount += crossRefsInvalid;

    const textoDerogadoCount = Array.isArray(article?.texto_derogado_parsed)
      ? article.texto_derogado_parsed.length
      : 0;
    const hasDerogadoText = textoDerogadoCount > 0;

    const latestYear = article?.ultima_modificacion_year ?? null;
    const totalNormas = Number(article?.total_normas || 0);

    if (item.total_mods > 0) hasModsCount += 1;
    if (item.has_normas) hasNormasCount += 1;
    if (hasDerogadoText) hasDerogadoTextCount += 1;

    libroCounts.set(item.libro, (libroCounts.get(item.libro) || 0) + 1);
    estadoCounts.set(item.estado, (estadoCounts.get(item.estado) || 0) + 1);
    if (latestYear) modYearCounts.set(latestYear, (modYearCounts.get(latestYear) || 0) + 1);

    return {
      ...item,
      titulo_corto: article?.titulo_corto || null,
      preview_snippet: firstSnippet(article, item.titulo),
      ultima_modificacion_year: latestYear,
      leyes_modificatorias: lawsRaw,
      leyes_modificatorias_normalized: Array.from(normalizedLawMap.values()),
      total_normas: totalNormas,
      texto_derogado_count: textoDerogadoCount,
      has_derogado_text: hasDerogadoText,
      cross_references_valid_count: crossRefsValid.length,
      cross_references_invalid_count: crossRefsInvalid,
      referenced_by_valid_count: referencedByValid.length,
    };
  });

  const yearsAvailable = Array.from(
    new Set(
      enriched
        .map((item) => item.ultima_modificacion_year)
        .filter((year) => Number.isInteger(year))
    )
  ).sort((a, b) => a - b);
  const latestYear = yearsAvailable[yearsAvailable.length - 1] || new Date().getFullYear();
  const earliestYear = yearsAvailable[0] || latestYear;

  const lawFacet = Array.from(lawCounts.entries())
    .map(([key, value]) => ({ key, label: value.label, count: value.count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const facetsPayload = {
    total_articles: enriched.length,
    generated_at: generatedAt,
    libros: Array.from(libroCounts.entries())
      .map(([key, count]) => ({ key, label: key, count }))
      .sort((a, b) => b.count - a.count),
    estados: Array.from(estadoCounts.entries())
      .map(([key, count]) => ({ key, label: key, count }))
      .sort((a, b) => b.count - a.count),
    mod_years: Array.from(modYearCounts.entries())
      .map(([year, count]) => ({ year: Number(year), count }))
      .sort((a, b) => b.year - a.year),
    laws: lawFacet.slice(0, 200),
    has_mods_count: hasModsCount,
    has_normas_count: hasNormasCount,
    has_derogado_text_count: hasDerogadoTextCount,
  };

  const featuredBase = enriched.map((item) => ({
    ...item,
    badges: buildFeaturedBadges(item, latestYear),
  }));

  const masConsultados = featuredBase
    .slice()
    .sort(
      (a, b) =>
        b.total_referenced_by - a.total_referenced_by ||
        b.total_refs - a.total_refs ||
        b.complexity - a.complexity
    )
    .slice(0, 12)
    .map((item) => ({
      ...item,
      reason: "Alta citación por otros artículos del ET",
    }));

  const masModificados = featuredBase
    .slice()
    .sort(
      (a, b) =>
        b.total_mods - a.total_mods ||
        (b.ultima_modificacion_year || 0) - (a.ultima_modificacion_year || 0)
    )
    .slice(0, 12)
    .map((item) => ({
      ...item,
      reason: "Artículo con múltiples reformas en el tiempo",
    }));

  const esencialesCandidatos = featuredBase
    .slice()
    .map((item) => ({
      ...item,
      estudiante_score:
        item.total_referenced_by * 2 +
        item.total_refs * 1.5 +
        item.complexity +
        item.total_mods * 0.4 +
        (item.has_normas ? 1.2 : 0),
    }))
    .sort((a, b) => b.estudiante_score - a.estudiante_score);

  const esencialesEstudiantes = pickWithLibroDiversity(esencialesCandidatos, 12).map(
    (item) => {
      const clone = { ...item };
      delete clone.estudiante_score;
      return {
        ...clone,
        reason: "Alta conectividad y relevancia para estudio transversal del ET",
      };
    }
  );

  const featuredPayload = {
    generated_at: generatedAt,
    mas_consultados: masConsultados,
    mas_modificados: masModificados,
    esenciales_estudiantes: esencialesEstudiantes,
  };

  const timelineInput = Array.isArray(dashboardStats.reform_timeline)
    ? dashboardStats.reform_timeline
    : [];

  const timelineClean = timelineInput
    .map((entry) => {
      const lawMap = new Map();
      for (const law of entry.laws || []) {
        const parsed = parseLawRef(law.name || "");
        const current = lawMap.get(parsed.key) || {
          name: parsed.label,
          count: 0,
        };
        current.count += Number(law.count || 0);
        lawMap.set(parsed.key, current);
      }

      const laws = Array.from(lawMap.values()).sort((a, b) => b.count - a.count);
      const total = laws.reduce((acc, law) => acc + law.count, 0);
      return {
        year: Number(entry.year),
        total: total || Number(entry.total || 0),
        laws,
      };
    })
    .sort((a, b) => a.year - b.year);

  const lawsTotalsMap = new Map();
  for (const yearEntry of timelineClean) {
    for (const law of yearEntry.laws) {
      lawsTotalsMap.set(law.name, (lawsTotalsMap.get(law.name) || 0) + law.count);
    }
  }

  const lawsTotals = Array.from(lawsTotalsMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const isInLatestYear = (item) => item.ultima_modificacion_year === latestYear;
  const modifiedHistorico = enriched.filter((item) => item.total_mods > 0);
  const modifiedLatest = enriched.filter((item) => item.total_mods > 0 && isInLatestYear(item));

  const ranges = [
    {
      key: "historico",
      label: "Histórico completo",
      modified_articles: modifiedHistorico.length,
      modified_percentage: toPct(modifiedHistorico.length, enriched.length),
      with_normas: modifiedHistorico.filter((item) => item.has_normas).length,
      with_derogado_text: modifiedHistorico.filter((item) => item.has_derogado_text).length,
      granularity: "year",
    },
    {
      key: "ultima_reforma",
      label: `Última reforma (${latestYear})`,
      modified_articles: modifiedLatest.length,
      modified_percentage: toPct(modifiedLatest.length, enriched.length),
      with_normas: modifiedLatest.filter((item) => item.has_normas).length,
      with_derogado_text: modifiedLatest.filter((item) => item.has_derogado_text).length,
      granularity: "year",
    },
    {
      key: "ultimos_12_meses",
      label: "Últimos 12 meses (aprox.)",
      modified_articles: modifiedLatest.length,
      modified_percentage: toPct(modifiedLatest.length, enriched.length),
      with_normas: modifiedLatest.filter((item) => item.has_normas).length,
      with_derogado_text: modifiedLatest.filter((item) => item.has_derogado_text).length,
      granularity: "year",
      note: `El dataset disponible está agregado por año. Se usa ${latestYear} como último periodo.`,
    },
  ];

  const topSlugs = new Set([
    ...(dashboardStats.top_modified || []).map((item) => item.slug),
    ...(dashboardStats.top_referenced || []).map((item) => item.slug),
  ]);

  const sparkStartYear = Math.max(earliestYear, latestYear - 11);
  const sparkYears = range(sparkStartYear, latestYear);

  const articleModificationTrends = Array.from(topSlugs)
    .map((slug) => {
      const article = articlesBySlug.get(slug);
      if (!article) return null;

      const byYear = new Map();
      for (const mod of article.modificaciones_parsed || []) {
        if (!Number.isInteger(mod.norma_year)) continue;
        byYear.set(mod.norma_year, (byYear.get(mod.norma_year) || 0) + 1);
      }

      return {
        slug: article.slug,
        id: article.id_articulo,
        titulo: article.titulo,
        series: sparkYears.map((year) => ({
          year,
          count: byYear.get(year) || 0,
        })),
      };
    })
    .filter(Boolean);

  const dashboardTimeseriesPayload = {
    generated_at: generatedAt,
    years: timelineClean.map((entry) => entry.year),
    latest_year: latestYear,
    granularity_notice:
      "Las métricas temporales provienen de datos agregados por año de reforma.",
    ranges,
    reform_timeline: timelineClean,
    laws_totals: lawsTotals,
    article_modification_trends: articleModificationTrends,
  };

  await Promise.all([
    writeJson(OUT_ENRICHED_INDEX, enriched),
    writeJson(OUT_EXPLORER_FACETS, facetsPayload),
    writeJson(OUT_FEATURED_ARTICLES, featuredPayload),
    writeJson(OUT_DASHBOARD_TIMESERIES, dashboardTimeseriesPayload),
  ]);

  process.stdout.write(
    [
      `Generated: ${path.relative(ROOT, OUT_ENRICHED_INDEX)}`,
      `Generated: ${path.relative(ROOT, OUT_EXPLORER_FACETS)}`,
      `Generated: ${path.relative(ROOT, OUT_FEATURED_ARTICLES)}`,
      `Generated: ${path.relative(ROOT, OUT_DASHBOARD_TIMESERIES)}`,
      `Articles: ${enriched.length}`,
      `Invalid cross-references detected: ${invalidCrossRefCount}`,
    ].join("\n") + "\n"
  );
}

main().catch((error) => {
  process.stderr.write(`build-analytics-datasets failed: ${error.stack || error}\n`);
  process.exit(1);
});
