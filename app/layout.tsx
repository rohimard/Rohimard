import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VideoLargo — vídeos de 8 minutos con NotebookLM",
  description:
    "Convierte una duración objetivo en un plan de bloques y en las instrucciones personalizadas listas para pegar en NotebookLM.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
