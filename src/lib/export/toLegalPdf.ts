interface LegalPdfOptions {
  title: string;
  subtitle?: string;
  bodyHtml: string;
  disclaimer?: string;
}

export function printLegalDocument({
  title,
  subtitle,
  bodyHtml,
  disclaimer = "Este documento es informativo y no constituye asesoría tributaria profesional.",
}: LegalPdfOptions): void {
  if (typeof window === "undefined") return;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 28px; color: #111; }
          h1 { margin: 0 0 8px; font-size: 20px; }
          .subtitle { margin: 0 0 4px; color: #555; font-size: 13px; }
          .meta { margin: 0 0 18px; color: #555; font-size: 12px; }
          .footer { margin-top: 28px; font-size: 11px; color: #666; border-top: 1px solid #ddd; padding-top: 8px; }
          @page { margin: 1.8cm; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ""}
        <p class="meta">Generado el ${new Date().toLocaleString("es-CO")} · SuperApp Tributaria Colombia</p>
        ${bodyHtml}
        <p class="footer">${disclaimer}</p>
      </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  }, 300);
}
