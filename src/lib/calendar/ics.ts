export interface IcsEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description?: string;
  location?: string;
}

function formatDateForIcs(dateIso: string): string {
  return dateIso.replace(/-/g, "");
}

function formatUtcTimestamp(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  const second = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

function addOneDay(dateIso: string): string {
  const [year, month, day] = dateIso.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  date.setDate(date.getDate() + 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function toIcsEventBlock(event: IcsEvent, dtStamp: string): string {
  const startDate = formatDateForIcs(event.date);
  const endDate = formatDateForIcs(addOneDay(event.date));
  const lines = [
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(event.id)}@superapp-tributaria-colombia`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }

  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

export function buildIcs(events: IcsEvent[], calendarName = "Calendario Fiscal Tributaria Colombia"): string {
  const dtStamp = formatUtcTimestamp(new Date());
  const eventBlocks = events.map((event) => toIcsEventBlock(event, dtStamp)).join("\r\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SuperApp Tributaria Colombia//Calendario Fiscal//ES",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    eventBlocks,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function downloadIcsFile(events: IcsEvent[], fileName: string): void {
  const content = buildIcs(events);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName.endsWith(".ics") ? fileName : `${fileName}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

