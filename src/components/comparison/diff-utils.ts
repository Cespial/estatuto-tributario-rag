export interface DiffSegment {
  type: "same" | "added" | "removed";
  text: string;
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
  const segments: DiffSegment[] = [];
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

  return segments;
}

function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

export function countChanges(segments: DiffSegment[]): { added: number; removed: number; same: number } {
  let added = 0, removed = 0, same = 0;
  for (const seg of segments) {
    const words = seg.text.split(/\s+/).length;
    if (seg.type === "added") added += words;
    else if (seg.type === "removed") removed += words;
    else same += words;
  }
  return { added, removed, same };
}
