import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Mundial 2026 | Admin",
  description: "Panel de administración para la Copa del Mundo FIFA 2026",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
