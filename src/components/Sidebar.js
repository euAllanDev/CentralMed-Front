"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Home, Users, Calendar, Activity, Stethoscope, 
  DollarSign, // <--- JÁ ESTÁ AQUI
  Package, LogOut, LayoutGrid, 
  BookOpen, // <--- GARANTA QUE ESTE ESTÁ AQUI
  Clock, FileUp
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, login, logout } = useAuth();

const menuItems = [
    // Roteamento Geral (Sem grupo)
    { name: "Dashboard", href: "/", icon: Home, roles: ["ADMIN"] },
    { name: "Painel Recepção", href: "/recepcao", icon: LayoutGrid, roles: ["RECEPCAO"] },
    { 
      name: "Gestão Usuários", // <-- ADICIONE DE VOLTA AQUI
      href: "/admin/usuarios", 
      icon: Users, 
      roles: ["ADMIN"], 
      group: "gestao" 
    },
    { name: "Consultório", href: "/medico", icon: Stethoscope, roles: ["ADMIN", "MEDICO"] },
    { name: "Triagem", href: "/triagem", icon: Activity, roles: ["ADMIN", "ENFERMAGEM"] },
    
    
    // Grupo de Gestão
    { name: "Pacientes", href: "/recepcao/pacientes", icon: Users, roles: ["ADMIN", "RECEPCAO"], group: "gestao" },
    { name: "Agenda do Dia", href: "/recepcao/agenda", icon: Clock, roles: ["ADMIN", "RECEPCAO"], group: "gestao" },
    
    // Grupo de Faturamento e Operacional
    { name: "Caixa", href: "/financeiro", icon: DollarSign, roles: ["ADMIN", "RECEPCAO"], group: "financeiro" },
    { name: "Estoque", href: "/estoque", icon: Package, roles: ["ADMIN", "ENFERMAGEM"], group: "financeiro" },
    { 
      name: "Parâmetros TISS", 
      href: "/admin/convenios", // <-- CORRIGIDO AQUI
      icon: BookOpen, 
      roles: ["ADMIN"], 
      group: "financeiro" 
    },
    { 
      name: 'Tabela de Preços', 
      href: '/admin/precos', // <-- CORRIGIDO AQUI
      icon: DollarSign, 
      roles: ['ADMIN'], 
      group: 'financeiro' 
    },
    { 
      name: 'Faturar Lotes', 
      href: '/admin/faturamento', 
      icon: FileUp, 
      roles: ['ADMIN'], 
      group: 'financeiro' 
    },
  ];

  // Filtra os itens baseado no perfil
  const filteredItems = menuItems.filter(item => {
    if (!user) return false;
    if (user.perfil === "ADMIN") return true; 
    return item.roles.includes(user.perfil);
  });

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col h-full border-r border-gray-200">
      
      {/* (Seu cabeçalho, info do usuário e a <nav> continuam intactos) */}
      
      <div className="h-16 flex items-center justify-center border-b border-gray-100">
        <Link 
          href={user?.perfil === 'RECEPCAO' ? '/recepcao' : user?.perfil === 'MEDICO' ? '/medico' : '/'} 
          className="text-2xl font-extrabold text-blue-600 tracking-tight cursor-pointer"
        >
          Central<span className="text-gray-700">Med</span>
        </Link>
      </div>

      <div className="bg-blue-50 p-4 border-b border-blue-100 flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold mb-2">
          {user?.nome?.charAt(0).toUpperCase() || "U"}
        </div>
        <p className="text-sm font-semibold text-gray-700 truncate w-full text-center">
          {user?.nome || "Visitante"}
        </p>
        <span className="text-xs px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full font-bold mt-1">
          {user?.perfil || "Deslogado"}
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-gray-600 hover:bg-blue-50 hover:bg-blue-600"
              }`}
            >
              <Icon size={20} className={isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}