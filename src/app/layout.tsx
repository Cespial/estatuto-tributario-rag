import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ArticlePanelProvider } from "@/contexts/article-panel-context";
import { SlideOutPanel } from "@/components/article/slide-out-panel";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Estatuto Tributario de Colombia - Consulta con IA",
  description:
    "Consulta inteligente de los 1,294 artículos del Estatuto Tributario colombiano con IA. Busca artículos, analiza modificaciones y explora relaciones entre normas.",
  openGraph: {
    title: "Estatuto Tributario de Colombia",
    description:
      "Consulta inteligente de los 1,294 artículos del Estatuto Tributario con IA",
    type: "website",
    locale: "es_CO",
    siteName: "Estatuto Tributario IA",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ArticlePanelProvider>
            {children}
            <SlideOutPanel />
          </ArticlePanelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
