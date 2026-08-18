import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CotizaPro — Cotizaciones profesionales en menos de 60 segundos",
    template: "%s · CotizaPro",
  },
  description:
    "Crea cotizaciones y presupuestos profesionales desde tu teléfono, genera un PDF y compártelos con tus clientes. Hecho para electricistas, plomeros, técnicos y trabajadores independientes.",
  keywords: [
    "cotizaciones",
    "presupuestos",
    "PDF",
    "electricista",
    "plomero",
    "trabajador independiente",
  ],
  applicationName: "CotizaPro",
  authors: [{ name: "CotizaPro" }],
};

export const viewport: Viewport = {
  themeColor: "#2456eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-dvh bg-white">{children}</body>
    </html>
  );
}
