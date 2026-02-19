"use client";

import { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import type { CalendarProfile } from "@/hooks/useCalendarProfiles";

interface NitProfileFilterProps {
  nitValue: string;
  onNitValueChange: (value: string) => void;
  nitFilters: string[];
  profiles: CalendarProfile[];
  activeProfileId: string | null;
  onApplyProfile: (profile: CalendarProfile | null) => void;
  onSaveProfile: (name: string, nitFilters: string[]) => void;
  onDeleteProfile: (profileId: string) => void;
}

export function NitProfileFilter({
  nitValue,
  onNitValueChange,
  nitFilters,
  profiles,
  activeProfileId,
  onApplyProfile,
  onSaveProfile,
  onDeleteProfile,
}: NitProfileFilterProps) {
  const [profileName, setProfileName] = useState("");

  const handleSelectProfile = (profileId: string) => {
    if (!profileId) {
      onApplyProfile(null);
      return;
    }
    const profile = profiles.find((item) => item.id === profileId) ?? null;
    onApplyProfile(profile);
  };

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="nit-filter" className="mb-1 block text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
            Último dígito NIT (uno o varios)
          </label>
          <input
            id="nit-filter"
            type="text"
            placeholder="Ej: 1,2,7"
            value={nitValue}
            onChange={(event) => onNitValueChange(event.target.value)}
            className="h-10 w-full rounded border border-border bg-background px-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Filtros activos: {nitFilters.length > 0 ? nitFilters.join(", ") : "ninguno"}
          </p>
        </div>

        <div>
          <label htmlFor="profile-select" className="mb-1 block text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
            Perfil guardado (mis clientes)
          </label>
          <div className="flex gap-2">
            <select
              id="profile-select"
              value={activeProfileId ?? ""}
              onChange={(event) => handleSelectProfile(event.target.value)}
              className="h-10 w-full rounded border border-border bg-background px-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
            >
              <option value="">Sin perfil</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} ({profile.nitFilters.join(", ")})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => activeProfileId && onDeleteProfile(activeProfileId)}
              disabled={!activeProfileId}
              className="inline-flex h-10 w-10 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Eliminar perfil"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="Nombre del perfil"
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
              className="h-10 w-full rounded border border-border bg-background px-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
            />
            <button
              type="button"
              onClick={() => {
                if (!profileName.trim()) return;
                onSaveProfile(profileName, nitFilters);
                setProfileName("");
              }}
              disabled={nitFilters.length === 0 || !profileName.trim()}
              className="inline-flex h-10 items-center gap-1 rounded border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save className="h-4 w-4" />
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

