import type { Metadata, Viewport } from "next";
import { Playfair_Display, Great_Vibes, Poppins } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
  weight: "400",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Momentia — Regalos que continúan después de abrirlos",
    template: "%s · Momentia",
  },
  description:
    "Cajas de regalo personalizadas con una experiencia digital exclusiva: escanea el QR de tu caja y descubre fotos, un video, una playlist y una carta hechos solo para ti.",
  keywords: [
    "regalos personalizados",
    "caja de regalo",
    "regalo con QR",
    "regalo digital",
    "Momentia",
    "Lima",
    "Perú",
  ],
  applicationName: "Momentia",
  authors: [{ name: "Momentia" }],
};

export const viewport: Viewport = {
  themeColor: "#6b0f1a",
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
    <html
      lang="es"
      className={`${poppins.variable} ${playfair.variable} ${greatVibes.variable}`}
    >
      <body className="min-h-dvh bg-cream-50">{children}</body>
    </html>
  );
}
