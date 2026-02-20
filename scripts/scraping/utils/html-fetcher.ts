/**
 * HTML Fetcher with encoding normalization for Colombian government sites.
 * Handles UTF-8/Latin-1 encoding issues common in DIAN, Senado, etc.
 */

export interface FetchResult {
  html: string;
  url: string;
  status: number;
  contentType: string;
}

export interface FetchOptions {
  /** Timeout in ms (default: 30000) */
  timeout?: number;
  /** Custom headers */
  headers?: Record<string, string>;
  /** Force encoding (auto-detected if not specified) */
  encoding?: "utf-8" | "latin1" | "iso-8859-1" | "windows-1252";
  /** Custom referer header */
  referer?: string;
}

const DEFAULT_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-CO,es;q=0.9,en;q=0.5",
  "Accept-Encoding": "identity",
};

export async function fetchHtml(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult> {
  const { timeout = 30000, headers = {}, encoding, referer } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const requestHeaders: Record<string, string> = { ...DEFAULT_HEADERS, ...headers };
  if (referer) {
    requestHeaders["Referer"] = referer;
  }

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: requestHeaders,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText} for ${url}`);
    }

    const contentType = response.headers.get("content-type") || "";

    // Auto-detect encoding from Content-Type header or use forced encoding
    let detectedEncoding = encoding;
    if (!detectedEncoding) {
      if (contentType.includes("iso-8859-1") || contentType.includes("latin")) {
        detectedEncoding = "iso-8859-1";
      } else if (contentType.includes("windows-1252")) {
        detectedEncoding = "windows-1252";
      }
    }

    let html: string;

    // Always read as ArrayBuffer first for non-UTF-8 content
    const buffer = await response.arrayBuffer();

    if (detectedEncoding) {
      const decoder = new TextDecoder(detectedEncoding);
      html = decoder.decode(buffer);
    } else {
      // Check for charset in the first bytes of HTML (meta tag)
      const quickDecode = new TextDecoder("utf-8").decode(buffer.slice(0, 2000));
      const charsetMatch = quickDecode.match(
        /charset=["']?([\w-]+)["']?/i
      );
      if (
        charsetMatch &&
        !charsetMatch[1].toLowerCase().includes("utf")
      ) {
        const decoder = new TextDecoder(charsetMatch[1]);
        html = decoder.decode(buffer);
      } else {
        html = new TextDecoder("utf-8").decode(buffer);
      }
    }

    // Normalize to NFC (canonical decomposition + composition)
    html = html.normalize("NFC");

    return {
      html,
      url: response.url, // May differ from input due to redirects
      status: response.status,
      contentType,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extract text content from HTML by stripping tags.
 * Lightweight alternative to full DOM parsing.
 */
/** Named HTML entities common in Colombian legal texts */
const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  // Latin-1 accented vowels
  Aacute: "Á", aacute: "á", Eacute: "É", eacute: "é",
  Iacute: "Í", iacute: "í", Oacute: "Ó", oacute: "ó",
  Uacute: "Ú", uacute: "ú", Uuml: "Ü", uuml: "ü",
  Ntilde: "Ñ", ntilde: "ñ",
  // Other common entities
  iquest: "¿", iexcl: "¡", ordm: "º", ordf: "ª",
  laquo: "«", raquo: "»", middot: "·",
  bull: "•", hellip: "…", ndash: "–", mdash: "—",
  ldquo: "\u201C", rdquo: "\u201D", lsquo: "\u2018", rsquo: "\u2019",
  copy: "©", reg: "®", trade: "™", deg: "°",
  frac12: "½", frac14: "¼", frac34: "¾",
  Agrave: "À", agrave: "à", Egrave: "È", egrave: "è",
  Igrave: "Ì", igrave: "ì", Ograve: "Ò", ograve: "ò",
  Ugrave: "Ù", ugrave: "ù",
  Atilde: "Ã", atilde: "ã", Otilde: "Õ", otilde: "õ",
  Auml: "Ä", auml: "ä", Euml: "Ë", euml: "ë",
  Iuml: "Ï", iuml: "ï", Ouml: "Ö", ouml: "ö",
  Acirc: "Â", acirc: "â", Ecirc: "Ê", ecirc: "ê",
  Icirc: "Î", icirc: "î", Ocirc: "Ô", ocirc: "ô",
  Ucirc: "Û", ucirc: "û",
  szlig: "ß", ccedil: "ç", Ccedil: "Ç",
};

export function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    // Replace block tags with newlines to preserve structure
    .replace(/<(?:p|div|br|tr|li|h[1-6]|article|section|blockquote)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&(\w+);/g, (match, name) => NAMED_ENTITIES[name] || match)
    .replace(/[ \t]+/g, " ") // Collapse horizontal whitespace only
    .replace(/\n\s*\n/g, "\n\n") // Collapse multiple newlines
    .trim();
}

/**
 * Extract specific content between markers in HTML.
 * Useful for extracting article text from pages with lots of boilerplate.
 */
export function extractBetween(
  html: string,
  startMarker: string | RegExp,
  endMarker: string | RegExp
): string | null {
  let startIdx: number;
  if (typeof startMarker === "string") {
    startIdx = html.indexOf(startMarker);
    if (startIdx === -1) return null;
    startIdx += startMarker.length;
  } else {
    const match = html.match(startMarker);
    if (!match || match.index === undefined) return null;
    startIdx = match.index + match[0].length;
  }

  let endIdx: number;
  if (typeof endMarker === "string") {
    endIdx = html.indexOf(endMarker, startIdx);
    if (endIdx === -1) return null;
  } else {
    const remaining = html.slice(startIdx);
    const match = remaining.match(endMarker);
    if (!match || match.index === undefined) return null;
    endIdx = startIdx + match.index;
  }

  return html.slice(startIdx, endIdx);
}
