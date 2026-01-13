"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Home, 
  Users, 
  Calendar, 
  Activity, 
  Stethoscope, 
  DollarSign, 
  Package, 
  LogOut,
  LayoutGrid // Novo ícone para o painel
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, login, logout } = useAuth();

  // Definição dos itens do menu
  const menuItems = [
    // 1. Dashboard GERAL (Só Admin)
    { 
      name: "Dashboard (Admin)", 
      href: "/", 
      icon: Home, 
      roles: ["ADMIN"] 
    },

    { 
      name: "Gestão Usuários", 
      href: "/admin/usuarios", 
      icon: Users, 
      roles: ["ADMIN"] 
    },

    // 2. Painel da Recepção (O botão que faltava!)
    { 
      name: "Painel Inicial", 
      href: "/recepcao", 
      icon: LayoutGrid, 
      roles: ["RECEPCAO"] 
    },

    // --- Módulos da Recepção ---
    { 
      name: "Pacientes", 
      href: "/recepcao/pacientes", 
      icon: Users, 
      roles: ["ADMIN", "RECEPCAO"] 
    },
    { 
      name: "Agenda", 
      href: "/recepcao/agenda", 
      icon: Calendar, 
      roles: ["ADMIN", "RECEPCAO"] 
    },

    // --- Módulos Clínicos ---
    { 
      name: "Triagem", 
      href: "/triagem", 
      icon: Activity, 
      roles: ["ADMIN", "ENFERMAGEM"] 
    },
    { 
      name: "Consultório", 
      href: "/medico", 
      icon: Stethoscope, 
      roles: ["ADMIN", "MEDICO"] 
    },

    // --- Operacional ---
    { 
      name: "Financeiro", 
      href: "/financeiro", 
      icon: DollarSign, 
      roles: ["ADMIN", "RECEPCAO"] 
    },
    { 
      name: "Estoque", 
      href: "/estoque", 
      icon: Package, 
      roles: ["ADMIN", "ENFERMAGEM", "MEDICO"] 
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
      
      {/* 1. Cabeçalho / Logo (Link inteligente para a home do usuário) */}
      <div className="h-16 flex items-center justify-center border-b border-gray-100">
        <Link 
          href={user?.perfil === 'RECEPCAO' ? '/recepcao' : user?.perfil === 'MEDICO' ? '/medico' : '/'} 
          className="text-2xl font-extrabold text-blue-600 tracking-tight cursor-pointer"
        >
          Central<span className="text-gray-700">Med</span>
        </Link>
      </div>

      {/* 2. Info do Usuário */}
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

      {/* 3. Navegação */}
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
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <Icon size={20} className={isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* 4. Logout */}
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