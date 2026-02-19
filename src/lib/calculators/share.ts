export type ShareStatus = "shared" | "copied" | "failed";

export interface SharePayload {
  title: string;
  text: string;
  url: string;
}

export async function shareCalculatorResult(payload: SharePayload): Promise<ShareStatus> {
  if (typeof window === "undefined") return "failed";

  try {
    if (navigator.share) {
      await navigator.share(payload);
      return "shared";
    }
  } catch {
    // fallback to clipboard
  }

  try {
    await navigator.clipboard.writeText(payload.url);
    return "copied";
  } catch {
    return "failed";
  }
}
