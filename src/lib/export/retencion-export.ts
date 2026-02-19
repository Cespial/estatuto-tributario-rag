import { RetencionConcepto } from "@/config/retencion-tabla-data";
import { downloadCsvFile, toCsv } from "./toCsv";

export function exportRetencionConceptsToCsv(
  concepts: RetencionConcepto[],
  uvtValue: number
): void {
  const rows = concepts.map((concept) => ({
    concepto: concept.concepto,
    base_min_uvt: concept.baseMinUVT,
    base_min_cop: concept.baseMinUVT * uvtValue,
    tarifa: (concept.tarifa * 100).toFixed(2),
    articulo: concept.articulo,
    notas: concept.notas || "",
  }));

  const csv = toCsv(rows, [
    { key: "concepto", header: "Concepto" },
    { key: "base_min_uvt", header: "Base Min UVT" },
    { key: "base_min_cop", header: "Base Min COP" },
    { key: "tarifa", header: "Tarifa (%)" },
    { key: "articulo", header: "Artículo ET" },
    { key: "notas", header: "Notas" },
  ]);

  downloadCsvFile(
    `tabla-retencion-${new Date().toISOString().split("T")[0]}.csv`,
    csv
  );
}

export function exportRetencionConceptsToExcelCompatible(
  concepts: RetencionConcepto[],
  uvtValue: number
): void {
  if (typeof window === "undefined") return;
  const rows = concepts
    .map(
      (concept) => `
      <tr>
        <td>${concept.concepto}</td>
        <td>${concept.baseMinUVT}</td>
        <td>${concept.baseMinUVT * uvtValue}</td>
        <td>${(concept.tarifa * 100).toFixed(2)}%</td>
        <td>${concept.articulo}</td>
        <td>${concept.notas || ""}</td>
      </tr>`
    )
    .join("");

  const html = `
    <table>
      <thead>
        <tr>
          <th>Concepto</th>
          <th>Base Min UVT</th>
          <th>Base Min COP</th>
          <th>Tarifa</th>
          <th>Artículo ET</th>
          <th>Notas</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tabla-retencion-${new Date().toISOString().split("T")[0]}.xls`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
