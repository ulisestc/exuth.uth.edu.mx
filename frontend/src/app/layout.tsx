import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Bolsa de Trabajo | Universidad Tecnológica de Huejotzingo",
  description: "Plataforma institucional de vinculación laboral y seguimiento de egresados de la Universidad Tecnológica de Huejotzingo (UTH).",
  keywords: ["UTH", "Huejotzingo", "Bolsa de Trabajo", "Egresados", "Empleo Puebla", "TSU", "Ingeniería"],
  openGraph: {
    title: "Bolsa de Trabajo UTH | Vinculación y Empleo",
    description: "Encuentra oportunidades de empleo exclusivas para egresados de la Universidad Tecnológica de Huejotzingo.",
    url: "https://exuth.uth.edu.mx",
    siteName: "Bolsa de Trabajo UTH",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col antialiased bg-[#F8FAFC] text-[#2D2926]">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
