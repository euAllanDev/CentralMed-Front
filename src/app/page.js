"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Users, AlertTriangle, DollarSign, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    pacientes: 0,
    estoqueBaixo: 0,
    faturamentoDia: 0,
    filaEspera: 0,
  });

  useEffect(() => {
    if (!user) return;

    if (user.perfil !== "ADMIN") {
      switch (user.perfil) {
        case "RECEPCAO": router.push("/recepcao"); break;
        case "MEDICO": router.push("/medico"); break;
        case "ENFERMAGEM": router.push("/triagem"); break;
        default: router.push("/login");
      }
      return;
    }

    carregarDados();
  }, [user, router]);

  async function carregarDados() {
    try {
      // O .catch evita que um erro em uma API trave as outras
      const [resPacientes, resEstoque, resFinanceiro, resFila] =
        await Promise.all([
          api.get("/recepcao/pacientes").catch(() => ({ data: [] })),
          api.get("/estoque").catch(() => ({ data: [] })),
          api.get("/financeiro").catch(() => ({ data: [] })),
          api.get("/recepcao/fila/triagem").catch(() => ({ data: [] })),
        ]);

      // --- PROTEÇÃO CONTRA CRASH (Array Check) ---
      
      // 1. Estoque
      const listaEstoque = Array.isArray(resEstoque.data) ? resEstoque.data : [];
      const estoqueBaixoCount = listaEstoque.filter(item => {
          // Calcula total garantindo que existe um número válido
          const total = item.lotes 
            ? item.lotes.reduce((acc, l) => acc + l.quantidade, 0) 
            : (item.qtdeAtual || 0);
          return total <= (item.qtdeMinima || 0);
      }).length;

      // 2. Financeiro
      const listaFinanceiro = Array.isArray(resFinanceiro.data) ? resFinanceiro.data : [];
      const totalFaturamento = listaFinanceiro.reduce((acc, curr) => acc + (curr.valor || 0), 0);

      // 3. Pacientes e Fila
      const totalPacientes = Array.isArray(resPacientes.data) ? resPacientes.data.length : 0;
      const totalFila = Array.isArray(resFila.data) ? resFila.data.length : 0;

      setStats({
        pacientes: totalPacientes,
        estoqueBaixo: estoqueBaixoCount,
        faturamentoDia: totalFaturamento,
        filaEspera: totalFila,
      });

    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    }
  }

  if (!user || user.perfil !== "ADMIN") return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Olá, <span className="text-blue-600">{user?.nome}</span>
        </h2>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card Pacientes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Pacientes</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.pacientes}</h3>
          </div>
        </div>

        {/* Card Faturamento */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Faturamento</p>
            <h3 className="text-2xl font-bold text-gray-800">
              R$ {stats.faturamentoDia.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* Card Fila */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Fila Triagem</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.filaEspera}</h3>
          </div>
        </div>

        {/* Card Estoque */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-full text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Estoque Crítico</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.estoqueBaixo}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[300px]">
          <h3 className="font-bold text-gray-700 mb-4">Avisos do Sistema</h3>
          <div className="space-y-3">
            {stats.estoqueBaixo > 0 && (
              <div className="p-3 bg-red-50 text-red-700 rounded border border-red-100 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>Atenção: Existem {stats.estoqueBaixo} itens com estoque baixo.</span>
              </div>
            )}
            <div className="p-3 bg-blue-50 text-blue-700 rounded border border-blue-100">
              <span>Bem-vindo ao sistema CentralMed v1.0</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center text-gray-400">
          (Gráfico de Atendimentos da Semana)
        </div>
      </div>
    </div>
  );
}