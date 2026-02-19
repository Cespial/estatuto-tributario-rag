import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
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

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#0f0e0d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "SuperApp Tributaria Colombia",
  description:
    "La super app tributaria de Colombia: 35 calculadoras, consulta inteligente con IA de los 1,294 artículos del Estatuto Tributario, calendario, indicadores, glosario y más.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tributaria CO",
  },
  openGraph: {
    title: "SuperApp Tributaria Colombia",
    description:
      "35 calculadoras tributarias, consulta con IA del Estatuto Tributario, calendario fiscal, indicadores y glosario.",
    type: "website",
    locale: "es_CO",
    siteName: "SuperApp Tributaria Colombia",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SuperApp Tributaria Colombia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SuperApp Tributaria Colombia",
    description: "La plataforma tributaria mas completa de Colombia.",
    images: ["/og-image.png"],
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
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ArticlePanelProvider>
            {children}
            <SlideOutPanel />
          </ArticlePanelProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
