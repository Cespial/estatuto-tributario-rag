export type TelemetryEventName =
  | "comparison_created"
  | "workspace_created"
  | "note_tagged"
  | "retencion_calculated"
  | "chat_feedback_submitted"
  | "chat_response_shared";

export function trackEvent(
  event: TelemetryEventName,
  payload: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") {
    // Lightweight telemetry placeholder: replace with analytics provider later.
    // Keeping this centralized prevents event-name drift in product code.
    console.info("[telemetry]", event, payload);
  }
}
