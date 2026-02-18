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
  title: "SuperApp Tributaria Colombia",
  description:
    "La super app tributaria de Colombia: 26 calculadoras, consulta inteligente con IA de los 1,294 artículos del Estatuto Tributario, calendario, indicadores, glosario y más.",
  openGraph: {
    title: "SuperApp Tributaria Colombia",
    description:
      "26 calculadoras tributarias, consulta con IA del Estatuto Tributario, calendario fiscal, indicadores y glosario.",
    type: "website",
    locale: "es_CO",
    siteName: "SuperApp Tributaria Colombia",
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
