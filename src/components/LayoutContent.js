"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function LayoutContent({ children }) {
  const pathname = usePathname();
  
  // Verifica se é a página de login
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    // Se for login, renderiza SEM Sidebar e SEM a estrutura flex do dashboard
    return <>{children}</>;
  }

  // Se for qualquer outra página, renderiza com Sidebar e Layout Flex
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}