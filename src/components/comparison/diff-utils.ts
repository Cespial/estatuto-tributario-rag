export interface DiffSegment {
  id: string;
  type: "same" | "added" | "removed" | "modified";
  text: string;
  oldText?: string;
  newText?: string;
  wordCount: number;
}

// LCS (Longest Common Subsequence) word-level diff
export function computeWordDiff(textA: string, textB: string): DiffSegment[] {
  const wordsA = tokenize(textA);
  const wordsB = tokenize(textB);

  // Build LCS table
  const m = wordsA.length;
  const n = wordsB.length;

  // Use space-optimized LCS approach for large texts
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (wordsA[i - 1] === wordsB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  const segments: Array<{ type: "same" | "added" | "removed"; text: string }> = [];
  let i = m, j = n;
  const result: Array<{ type: "same" | "added" | "removed"; word: string }> = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && wordsA[i - 1] === wordsB[j - 1]) {
      result.unshift({ type: "same", word: wordsA[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: "added", word: wordsB[j - 1] });
      j--;
    } else {
      result.unshift({ type: "removed", word: wordsA[i - 1] });
      i--;
    }
  }

  // Merge consecutive same-type segments
  for (const item of result) {
    const last = segments[segments.length - 1];
    if (last && last.type === item.type) {
      last.text += " " + item.word;
    } else {
      segments.push({ type: item.type, text: item.word });
    }
  }

  return normalizeSegments(segments);
}

function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function normalizeSegments(
  input: Array<{ type: "same" | "added" | "removed"; text: string }>
): DiffSegment[] {
  const normalized: DiffSegment[] = [];
  let pointer = 0;

  while (pointer < input.length) {
    const current = input[pointer];
    const next = input[pointer + 1];

    if (
      current.type === "removed" &&
      next &&
      next.type === "added"
    ) {
      const oldText = current.text.trim();
      const newText = next.text.trim();
      const wordCount = Math.max(
        oldText ? oldText.split(/\s+/).length : 0,
        newText ? newText.split(/\s+/).length : 0
      );
      normalized.push({
        id: `seg-${pointer}`,
        type: "modified",
        text: newText,
        oldText,
        newText,
        wordCount,
      });
      pointer += 2;
      continue;
    }

    const text = current.text.trim();
    normalized.push({
      id: `seg-${pointer}`,
      type: current.type,
      text,
      wordCount: text ? text.split(/\s+/).length : 0,
    });
    pointer += 1;
  }

  return normalized;
}

export interface DiffStats {
  added: number;
  removed: number;
  modified: number;
  same: number;
}

export function countChanges(segments: DiffSegment[]): DiffStats {
  let added = 0, removed = 0, modified = 0, same = 0;
  for (const seg of segments) {
    const words = seg.wordCount || seg.text.split(/\s+/).length;
    if (seg.type === "added") added += words;
    else if (seg.type === "removed") removed += words;
    else if (seg.type === "modified") modified += words;
    else same += words;
  }
  return { added, removed, modified, same };
}

export interface SideBySideDiffRow {
  id: string;
  changeType: "same" | "added" | "removed" | "modified";
  leftText: string;
  rightText: string;
}

export function buildSideBySideRows(segments: DiffSegment[]): SideBySideDiffRow[] {
  return segments.map((segment) => {
    if (segment.type === "same") {
      return {
        id: segment.id,
        changeType: "same",
        leftText: segment.text,
        rightText: segment.text,
      };
    }

    if (segment.type === "added") {
      return {
        id: segment.id,
        changeType: "added",
        leftText: "",
        rightText: segment.text,
      };
    }

    if (segment.type === "removed") {
      return {
        id: segment.id,
        changeType: "removed",
        leftText: segment.text,
        rightText: "",
      };
    }

    return {
      id: segment.id,
      changeType: "modified",
      leftText: segment.oldText || "",
      rightText: segment.newText || segment.text,
    };
  });
}

export interface DiffSummary {
  totalWords: number;
  totalChanges: number;
  changeRatio: number;
  stats: DiffStats;
}

export function summarizeDiff(segments: DiffSegment[]): DiffSummary {
  const stats = countChanges(segments);
  const totalWords = stats.added + stats.removed + stats.modified + stats.same;
  const totalChanges = stats.added + stats.removed + stats.modified;
  const changeRatio = totalWords > 0 ? totalChanges / totalWords : 0;
  return {
    totalWords,
    totalChanges,
    changeRatio,
    stats,
  };
}
