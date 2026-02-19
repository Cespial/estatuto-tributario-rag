"use client";

import { useEffect } from "react";
import { useRecents } from "@/hooks/useRecents";
import { RecentItemType } from "@/types/productivity";

interface RecentVisitTrackerProps {
  id: string;
  title: string;
  href: string;
  type: RecentItemType;
  slug?: string;
}

export function RecentVisitTracker({
  id,
  title,
  href,
  type,
  slug,
}: RecentVisitTrackerProps) {
  const { trackRecent } = useRecents();

  useEffect(() => {
    trackRecent({ id, title, href, type, slug });
  }, [id, title, href, type, slug, trackRecent]);

  return null;
}
