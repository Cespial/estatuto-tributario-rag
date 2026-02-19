"use client";

import { useState, useMemo } from "react";
import { Search, Calendar, Filter } from "lucide-react";
import { OBLIGACIONES, CALENDARIO_DISCLAIMER } from "@/config/calendario-data";
import { ReferencePageLayout } from "@/components/layout/ReferencePageLayout";
import { AddToCalendarButton } from "@/components/calendar/AddToCalendarButton";
import { clsx } from "clsx";

export default function CalendarioPage() {
  const [search, setSearch] = useState("");
  const [nit, setNit] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [obligacionFiltro, setObligacionFiltro] = useState<string>("todas");

  const obligationsList = useMemo(() => {
    const list: Array<{
      obligacion: string;
      periodo: string;
      ultimoDigito: string;
      fecha: string;
      tipo: string;
    }> = [];

    OBLIGACIONES.forEach((ob) => {
      ob.vencimientos.forEach((v) => {
        list.push({
          obligacion: ob.obligacion,
          periodo: v.periodo,
          ultimoDigito: v.ultimoDigito,
          fecha: v.fecha,
          tipo: ob.tipoContribuyente,
        });
      });
    });

    return list.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, []);

  const filteredItems = useMemo(() => {
    return obligationsList.filter((item) => {
      const matchesSearch = item.obligacion.toLowerCase().includes(search.toLowerCase()) || 
                           item.periodo.toLowerCase().includes(search.toLowerCase());
      const matchesNit = nit === "" || item.ultimoDigito.includes(nit);
      const matchesTipo = tipoFiltro === "todos" || item.tipo === tipoFiltro;
      const matchesObligacion = obligacionFiltro === "todas" || item.obligacion === obligacionFiltro;

      return matchesSearch && matchesNit && matchesTipo && matchesObligacion;
    });
  }, [obligationsList, search, nit, tipoFiltro, obligacionFiltro]);

  const today = new Date().toISOString().split("T")[0];

  const getStatus = (fecha: string) => {
    if (fecha < today) return "pasado";
    const diff = new Date(fecha).getTime() - new Date(today).getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    if (days <= 30) return "proximo";
    return "vigente";
  };

  const uniqueObligations = Array.from(new Set(OBLIGACIONES.map(o => o.obligacion)));

  return (
    <ReferencePageLayout
      title="Calendario Tributario 2026"
      description="Consulte los vencimientos de sus obligaciones tributarias ante la DIAN para el año 2026."
      icon={Calendar}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar obligacion..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-full rounded border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
          />
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">NIT</div>
          <input
            type="text"
            placeholder="Últimos dígitos"
            value={nit}
            onChange={(e) => setNit(e.target.value)}
            className="h-12 w-full rounded border border-border bg-card pl-12 pr-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
          />
        </div>

        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          className="h-12 w-full rounded border border-border bg-card px-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
        >
          <option value="todos">Todos los contribuyentes</option>
          <option value="naturales">Personas Naturales</option>
          <option value="juridicas">Personas Jurídicas</option>
          <option value="grandes">Grandes Contribuyentes</option>
        </select>

        <select
          value={obligacionFiltro}
          onChange={(e) => setObligacionFiltro(e.target.value)}
          className="h-12 w-full rounded border border-border bg-card px-3 text-sm outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20"
        >
          <option value="todas">Todas las obligaciones</option>
          {uniqueObligations.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Obligación</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Periodo</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">NIT</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Vencimiento</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-[0.05em] font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => {
                  const status = getStatus(item.fecha);
                  return (
                    <tr key={idx} className={clsx(
                      "hover:bg-muted/30 transition-colors",
                      status === "pasado" && "opacity-60 bg-muted/10"
                    )}>
                      <td className="px-4 py-3 font-medium">{item.obligacion}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.periodo}</td>
                      <td className="px-4 py-3 font-mono">{item.ultimoDigito}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{item.fecha}</td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
                          status === "pasado" && "bg-muted text-muted-foreground border-border",
                          status === "proximo" && "bg-foreground text-background border-foreground",
                          status === "vigente" && "bg-muted text-foreground border-border"
                        )}>
                          {status === "pasado" ? "Vencido" : status === "proximo" ? "Próximo" : "Vigente"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {status !== "pasado" && (
                          <AddToCalendarButton 
                            title={`${item.obligacion} (NIT ${item.ultimoDigito})`}
                            date={item.fecha}
                            description={`Vencimiento ${item.obligacion} - Periodo ${item.periodo}. Fuente: SuperApp Tributaria Colombia.`}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="h-8 w-8 opacity-20" />
                      <p>No se encontraron vencimientos con los filtros aplicados.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border/40 bg-muted/30 p-4 text-xs text-muted-foreground">
        <p><strong>Nota legal:</strong> {CALENDARIO_DISCLAIMER}</p>
      </div>
    </ReferencePageLayout>
  );
}
