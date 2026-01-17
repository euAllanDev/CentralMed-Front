"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Home, Users, Calendar, Activity, Stethoscope, DollarSign, Package, LogOut, LayoutGrid, Clock, BookOpen, FileUp, FileText, ChevronRight
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    // --- Itens Principais (Acesso Rápido) ---
    { name: "Dashboard", href: "/", icon: Home, roles: ["ADMIN"] },
    { name: "Painel Recepção", href: "/recepcao", icon: LayoutGrid, roles: ["RECEPCAO"] },
    { name: "Consultório", href: "/medico", icon: Stethoscope, roles: ["ADMIN", "MEDICO"] },
    { name: "Triagem", href: "/triagem", icon: Activity, roles: ["ADMIN", "ENFERMAGEM"] },
    
    // --- Grupo de Gestão ---
    { name: "Gestão de Usuários", href: "/admin/usuarios", icon: Users, roles: ["ADMIN"], group: "gestao" },
    { name: "Pacientes", href: "/recepcao/pacientes", icon: Users, roles: ["ADMIN", "RECEPCAO"], group: "gestao" },
    { name: "Agenda Geral", href: "/recepcao/agenda-geral", icon: Calendar, roles: ["ADMIN", "RECEPCAO"], group: "gestao" },
    { name: "Fila do Dia", href: "/recepcao/agenda", icon: Clock, roles: ["ADMIN", "RECEPCAO"], group: "gestao" },
    
    // --- Grupo Operacional ---
    { name: "Caixa", href: "/financeiro", icon: DollarSign, roles: ["ADMIN", "RECEPCAO"], group: "operacional" },
    { name: "Estoque", href: "/estoque", icon: Package, roles: ["ADMIN", "ENFERMAGEM"], group: "operacional" },
    
    // --- Grupo Faturamento (TISS) ---
    { name: "Parâmetros TISS", href: "/admin/convenios", icon: BookOpen, roles: ["ADMIN"], group: "faturamento" },
    { name: 'Tabela de Preços', href: '/admin/precos', icon: DollarSign, roles: ['ADMIN'], group: 'faturamento' },
    { name: 'Faturar Lotes', href: '/admin/faturamento', icon: FileUp, roles: ['ADMIN'], group: 'faturamento' },
    { name: "Emitir Notas (NFS-e)", href: "/admin/notas-fiscais", icon: FileText, roles: ["ADMIN"], group: "faturamento" },
  ];

  const filteredItems = menuItems.filter((item) => {
    if (!user) return false;
    if (user.perfil === "ADMIN") return true;
    return item.roles.includes(user.perfil);
  });

  const renderNavItems = (groupName) => {
    return filteredItems
      .filter((item) => item.group === groupName)
      .map((item) => (
        <NavItem key={item.href} item={item} pathname={pathname} />
      ));
  };

  const getInitials = (name) => {
    return name ? name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "U";
  };

  return (
    <aside className="w-72 bg-white flex flex-col h-full border-r border-slate-200 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-50">
      
      <div className="h-20 flex items-center px-6 border-b border-slate-100 bg-white">
        <Link href={user?.perfil === "RECEPCAO" ? "/recepcao" : "/"} className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
            <Activity className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-800 group-hover:text-blue-700 transition-colors">
            Central<span className="text-blue-600">Med</span>
          </span>
        </Link>
      </div>

      <div className="px-4 py-6">
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm border-2 border-white shadow-sm shrink-0">
            {getInitials(user?.nome)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-700 truncate">{user?.nome}</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600 truncate">{user?.perfil}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pb-6">
        {/* Itens Principais (sem grupo) */}
        <div className="space-y-1">
          {filteredItems.filter((item) => !item.group).map((item) => <NavItem key={item.href} item={item} pathname={pathname} />)}
        </div>
        
        {/* Grupo Gestão */}
        {renderNavItems("gestao").length > 0 && <div>
          <h3 className="px-3 mb-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Gestão</h3>
          <div className="space-y-1">{renderNavItems("gestao")}</div>
        </div>}
        
        {/* Grupo Operacional */}
        {renderNavItems("operacional").length > 0 && <div>
          <h3 className="px-3 mb-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Operacional</h3>
          <div className="space-y-1">{renderNavItems("operacional")}</div>
        </div>}

        {/* Grupo Faturamento */}
        {user?.perfil === "ADMIN" && renderNavItems("faturamento").length > 0 && <div>
          <h3 className="px-3 mb-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Faturamento</h3>
          <div className="space-y-1">{renderNavItems("faturamento")}</div>
        </div>}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-white">
        <button
          onClick={logout}
          className="w-full group flex items-center justify-between gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl text-sm font-medium transition-all"
        >
          <div className="flex items-center gap-3">
            <LogOut size={18} /> <span>Encerrar Sessão</span>
          </div>
        </button>
      </div>
    </aside>
  );
}

function NavItem({ item, pathname }) {
  const Icon = item.icon;
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      className={`relative flex items-center justify-between px-3 py-2.5 rounded-lg group ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-600 hover:bg-slate-100 hover:text-blue-700"}`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`} />
        <span className="font-medium text-sm tracking-tight">{item.name}</span>
      </div>
      {isActive ? (<div className="w-1.5 h-1.5 bg-white rounded-full opacity-70"></div>) : 
        (<ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-slate-400" />)}
    </Link>
  );
}