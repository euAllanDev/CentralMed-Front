"use client";
import { usePathname } from "next/navigation";
import "./globals.css";
import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });
export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <html lang="pt-br">
      <body className="...">
        <AuthProvider>
          <div className="flex h-screen">
            {/* Só mostra Sidebar se NÃO for login */}
            {!isLoginPage && <Sidebar />}

            <main
              className={`flex-1 overflow-y-auto ${!isLoginPage ? "p-8" : ""}`}
            >
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
