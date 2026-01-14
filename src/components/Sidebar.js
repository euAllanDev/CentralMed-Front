"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Home, Users, Calendar, Activity, Stethoscope, 
  DollarSign, Package, LogOut, LayoutGrid, Clock, BookOpen, FileUp, FileText
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth(); 

  const menuItems = [
    { name: "Dashboard", href: "/", icon: Home, roles: ["ADMIN"] },
    { name: "Painel Recepção", href: "/recepcao", icon: LayoutGrid, roles: ["RECEPCAO"] },
    { name: "Agenda", href: "/recepcao/agenda", icon: Clock, roles: ["ADMIN", "RECEPCAO"] },
    { name: "Pacientes", href: "/recepcao/pacientes", icon: Users, roles: ["ADMIN", "RECEPCAO"] },
    { name: "Triagem", href: "/triagem", icon: Activity, roles: ["ADMIN", "ENFERMAGEM"] },
    { name: "Consultório", href: "/medico", icon: Stethoscope, roles: ["ADMIN", "MEDICO"] },
    { name: "Financeiro (Caixa)", href: "/financeiro", icon: DollarSign, roles: ["ADMIN", "RECEPCAO"], group: "operacional" },
    { name: "Estoque", href: "/estoque", icon: Package, roles: ["ADMIN", "ENFERMAGEM"], group: "operacional" },
    { name: "Parâmetros TISS", href: "/admin/convenios", icon: BookOpen, roles: ["ADMIN"], group: "faturamento" },
    { name: "Faturar Lotes", href: "/admin/faturamento", icon: FileUp, roles: ["ADMIN"], group: "faturamento" },
    { name: "Emitir Notas (NFS-e)", href: "/admin/notas-fiscais", icon: FileText, roles: ["ADMIN"], group: "faturamento" },
  ];

  const filteredItems = menuItems.filter(item => {
    if (!user) return false;
    if (user.perfil === "ADMIN") return true; 
    return item.roles.includes(user.perfil);
  });

  const renderNavItems = (groupName) => {
    return filteredItems
      .filter(item => item.group === groupName)
      .map(item => <NavItem key={item.href} item={item} pathname={pathname} />);
  };

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col h-full border-r border-gray-200">
      
      <div className="h-16 flex items-center justify-center border-b border-gray-100">
        <Link href={user?.perfil === 'RECEPCAO' ? '/recepcao' : '/'} className="text-2xl font-extrabold text-blue-600">
          CentralMed
        </Link>
      </div>

      <div className="bg-blue-50 p-4 border-b border-blue-100 text-center">
        <p className="text-sm font-semibold text-gray-800">{user?.nome}</p>
        <span className="text-xs px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full font-bold">{user?.perfil}</span>
      </div>
      
      <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
        {filteredItems.filter(item => !item.group).map(item => <NavItem key={item.href} item={item} pathname={pathname} />)}
        
        <div>
          <h3 className="px-3 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase">Operacional</h3>
          <div className="space-y-1">
            {renderNavItems("operacional")}
          </div>
        </div>

        {user?.perfil === "ADMIN" && (
          <div>
            <h3 className="px-3 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase">Faturamento</h3>
            <div className="space-y-1">
              {renderNavItems("faturamento")}
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg text-sm font-medium">
          <LogOut size={16} /> Sair
        </button>
      </div>
    </aside>
  );
}

function NavItem({ item, pathname }) {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    return (
        <Link href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-blue-50"}`}>
            <Icon size={20} className={isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"} />
            <span className="font-medium text-sm">{item.name}</span>
        </Link>
    );
}