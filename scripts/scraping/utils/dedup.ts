/**
 * Deduplication utilities for scraped legal documents.
 * Uses composite keys to identify and merge duplicates.
 */

export interface Deduplicable {
  id: string;
  [key: string]: unknown;
}

/**
 * Deduplicate an array of items by their id field.
 * When duplicates found, keeps the one with more content (longer text fields).
 */
export function dedup<T extends Deduplicable>(items: T[]): T[] {
  const map = new Map<string, T>();

  for (const item of items) {
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, item);
    } else {
      // Keep the more complete version
      const existingSize = JSON.stringify(existing).length;
      const newSize = JSON.stringify(item).length;
      if (newSize > existingSize) {
        map.set(item.id, item);
      }
    }
  }

  return Array.from(map.values());
}

/**
 * Generate a deterministic ID for a doctrina document.
 */
export function doctrinaId(
  tipo: string,
  numero: string,
  year: number
): string {
  const normalizedTipo = tipo.toLowerCase().replace(/\s+/g, "-");
  return `dian-${normalizedTipo}-${numero}-${year}`;
}

/**
 * Generate a deterministic ID for a sentencia.
 */
export function sentenciaId(
  corte: "constitucional" | "consejo-estado",
  tipo: string,
  numero: string,
  year: number
): string {
  const prefix = corte === "constitucional" ? "cc" : "ce-s4";
  return `${prefix}-${tipo.toLowerCase()}-${numero}-${year}`;
}

/**
 * Generate a deterministic ID for a decreto article.
 */
export function decretoId(
  decretoNumero: string,
  articuloNumero: string
): string {
  return `dur-${decretoNumero}-art-${articuloNumero}`;
}

/**
 * Generate a deterministic ID for a resolucion.
 */
export function resolucionId(numero: string, year: number): string {
  return `dian-resolucion-${numero}-${year}`;
}

/**
 * Load existing scraped data from a directory to check for already-scraped items.
 * Returns a Set of existing IDs.
 */
export function loadExistingIds(dir: string): Set<string> {
  const fs = require("fs") as typeof import("fs");
  const path = require("path") as typeof import("path");
  const ids = new Set<string>();

  if (!fs.existsSync(dir)) return ids;

  const files = fs.readdirSync(dir).filter((f: string) => f.endsWith(".json"));
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.id) ids.add(item.id);
        }
      } else if (data.id) {
        ids.add(data.id);
      }
    } catch {
      // Skip malformed files
    }
  }

  return ids;
}
