"use client";

import { CalendarPlus, Download } from "lucide-react";
import { downloadIcsFile } from "@/lib/calendar/ics";

interface AddToCalendarButtonProps {
  title: string;
  date: string; // YYYY-MM-DD
  description?: string;
}

export function AddToCalendarButton({ title, date, description }: AddToCalendarButtonProps) {
  const handleAddToGoogleCalendar = () => {
    // Format dates for Google Calendar (YYYYMMDD)
    const eventDate = date.replace(/-/g, "");
    const details = description ? `&details=${encodeURIComponent(description)}` : "";
    const text = `&text=${encodeURIComponent(title)}`;
    const dates = `&dates=${eventDate}/${eventDate}`; // All day event
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE${text}${dates}${details}`;
    
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadIcs = () => {
    downloadIcsFile(
      [
        {
          id: `${title}-${date}`.replace(/[^\w-]/g, ""),
          title,
          date,
          description,
        },
      ],
      `${title.toLowerCase().replace(/\s+/g, "-")}-${date}.ics`
    );
  };

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={handleAddToGoogleCalendar}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
        title="Agregar a Google Calendar"
      >
        <CalendarPlus className="h-3.5 w-3.5" />
        Google
      </button>
      <button
        type="button"
        onClick={handleDownloadIcs}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title="Descargar archivo ICS"
      >
        <Download className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
