import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movitek | Calculadora iPhone",
  description: "Calculadora publica de costos y cuotas para comprar tu proximo iPhone en Movitek.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
