import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import LayoutContent from "@/components/LayoutContent";

// Configura a fonte para ser usada em todo o site através de uma variável CSS
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Define uma variável CSS para a fonte
});

// Metadados para SEO e para o título da aba do navegador
export const metadata = {
  title: "CentralMed",
  description: "Sistema de Gestão Clínica Integrado - CentralMed v1.0",
};

export default function RootLayout({ children }) {
  return (
    // 'suppressHydrationWarning' é útil para evitar avisos comuns com extensões de navegador
    <html lang="pt-BR" suppressHydrationWarning>
      {/* 
        A variável da fonte é aplicada aqui.
        O 'antialiased' suaviza a renderização da fonte.
      */}
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
