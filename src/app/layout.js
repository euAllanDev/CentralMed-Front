import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import LayoutContent from "@/components/LayoutContent"; // <--- Importamos o novo componente

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CentralMed",
  description: "Sistema de Gestão Clínica",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <AuthProvider>
          {/* O LayoutContent agora decide se mostra sidebar ou não */}
          <LayoutContent>
            {children}
          </LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}