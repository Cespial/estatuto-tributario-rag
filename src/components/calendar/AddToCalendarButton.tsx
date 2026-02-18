"use client";

import { CalendarPlus } from "lucide-react";

interface AddToCalendarButtonProps {
  title: string;
  date: string; // YYYY-MM-DD
  description?: string;
}

export function AddToCalendarButton({ title, date, description }: AddToCalendarButtonProps) {
  const handleAddToCalendar = () => {
    // Format dates for Google Calendar (YYYYMMDD)
    const eventDate = date.replace(/-/g, "");
    const details = description ? `&details=${encodeURIComponent(description)}` : "";
    const text = `&text=${encodeURIComponent(title)}`;
    const dates = `&dates=${eventDate}/${eventDate}`; // All day event
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE${text}${dates}${details}`;
    
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleAddToCalendar}
      className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
      title="Agregar a Google Calendar"
    >
      <CalendarPlus className="h-3.5 w-3.5" />
      Agendar
    </button>
  );
}
