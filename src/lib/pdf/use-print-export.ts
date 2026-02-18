"use client";
import { useRef, useCallback } from "react";

interface UsePrintExportOptions {
  title?: string;
}

export function usePrintExport(options: UsePrintExportOptions = {}) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => {
    if (!contentRef.current) return;

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

    // Copy stylesheets from parent
    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n");
        } catch {
          // Cross-origin stylesheets
          if (sheet.href) {
            return `@import url("${sheet.href}");`;
          }
          return "";
        }
      })
      .join("\n");

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${options.title || "SuperApp Tributaria Colombia"}</title>
          <style>
            ${styles}
            @media print {
              body {
                font-size: 12pt;
                color: #000;
                background: #fff;
              }
              .no-print { display: none !important; }
              @page { margin: 2cm; }
            }
          </style>
        </head>
        <body>
          ${contentRef.current.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  }, [options.title]);

  return { contentRef, handlePrint };
}
