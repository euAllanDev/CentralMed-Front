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
    // 1. Aguarda o usuário ser carregado pelo Contexto
    if (!user) return;

    // 2. Lógica de Proteção: Se NÃO for ADMIN, redireciona
    if (user.perfil !== "ADMIN") {
      switch (user.perfil) {
        case "RECEPCAO":
          router.push("/recepcao");
          break;
        case "MEDICO":
          router.push("/medico");
          break;
        case "ENFERMAGEM":
          router.push("/triagem");
          break;
        default:
          router.push("/login"); // Se perfil for inválido, manda pro login
      }
      return; // Para a execução aqui para não buscar dados desnecessários
    }

    // 3. Se chegou aqui, é ADMIN. Então carrega os dados.
    carregarDados();
  }, [user, router]);

  async function carregarDados() {
    try {
      const [resPacientes, resEstoque, resFinanceiro, resFila] =
        await Promise.all([
          api.get("/recepcao/pacientes"),
          api.get("/estoque"),
          api.get("/financeiro"),
          api.get("/recepcao/fila/triagem"),
        ]);

      const estoqueBaixoCount = resEstoque.data.filter(
        (i) => i.qtdeAtual <= i.qtdeMinima
      ).length;

      const totalFaturamento = resFinanceiro.data.reduce(
        (acc, curr) => acc + curr.valor,
        0
      );

      setStats({
        pacientes: resPacientes.data.length,
        estoqueBaixo: estoqueBaixoCount,
        faturamentoDia: totalFaturamento,
        filaEspera: resFila.data.length,
      });
    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    }
  }

  // Evita "piscar" a tela do Admin antes de redirecionar
  if (!user || user.perfil !== "ADMIN") {
    return null; // Ou coloque um <div className="p-8">Carregando...</div>
  }

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

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Pacientes</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {stats.pacientes}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Faturamento</p>
            <h3 className="text-2xl font-bold text-gray-800">
              R${" "}
              {stats.faturamentoDia.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Fila Triagem</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {stats.filaEspera}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-full text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Estoque Crítico</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {stats.estoqueBaixo}
            </h3>
          </div>
        </div>
      </div>

      {/* Área de Gráficos / Avisos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[300px]">
          <h3 className="font-bold text-gray-700 mb-4">Avisos do Sistema</h3>
          <div className="space-y-3">
            {stats.estoqueBaixo > 0 && (
              <div className="p-3 bg-red-50 text-red-700 rounded border border-red-100 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>
                  Atenção: Existem {stats.estoqueBaixo} itens abaixo do estoque
                  mínimo.
                </span>
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