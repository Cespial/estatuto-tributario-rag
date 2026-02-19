"use client";

import { useMemo, useState } from "react";
import {
  RETENCION_WIZARD_PAYMENT_TYPES,
  type RetencionConcepto,
} from "@/config/retencion-tabla-data";
import { UI_COPY } from "@/config/ui-copy";

interface RetentionConceptWizardProps {
  conceptos: RetencionConcepto[];
  onSelectConcept: (concepto: RetencionConcepto) => void;
}

type ProfileType = "declarante" | "no-declarante" | "ambos";

export function RetentionConceptWizard({
  conceptos,
  onSelectConcept,
}: RetentionConceptWizardProps) {
  const [paymentType, setPaymentType] = useState<string>("");
  const [profile, setProfile] = useState<ProfileType>("ambos");

  const recommendation = useMemo(() => {
    if (!paymentType) return null;
    const selectedType = RETENCION_WIZARD_PAYMENT_TYPES.find((type) => type.id === paymentType);
    if (!selectedType) return null;

    return (
      conceptos.find((concepto) => {
        const keywords = concepto.keywords || [];
        const keywordMatch = selectedType.keywords.some((keyword) =>
          keywords.some((item) => item.includes(keyword))
        );
        const profileMatch =
          concepto.aplicaA === "ambos" ||
          !concepto.aplicaA ||
          concepto.aplicaA === profile;
        return keywordMatch && profileMatch;
      }) || null
    );
  }, [paymentType, profile, conceptos]);

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
      <h3 className="heading-serif text-lg">{UI_COPY.retencion.wizardTitle}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{UI_COPY.retencion.wizardSubtitle}</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
            Tipo de pago
          </label>
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-foreground/30"
          >
            <option value="">Seleccione una opción</option>
            {RETENCION_WIZARD_PAYMENT_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
            Perfil del tercero
          </label>
          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value as ProfileType)}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-foreground/30"
          >
            <option value="ambos">No aplica / ambos</option>
            <option value="declarante">Declarante</option>
            <option value="no-declarante">No declarante</option>
          </select>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-border/60 bg-muted/20 p-3">
        {recommendation ? (
          <>
            <p className="text-sm font-medium text-foreground">{recommendation.concepto}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tarifa {(recommendation.tarifa * 100).toFixed(2)}% · Art. {recommendation.articulo}
            </p>
            <button
              onClick={() => onSelectConcept(recommendation)}
              className="mt-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              Ir al concepto recomendado
            </button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Seleccione tipo de pago y perfil para obtener una recomendación.
          </p>
        )}
      </div>
    </div>
  );
}
