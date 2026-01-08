"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Users, AlertTriangle, DollarSign, Activity } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pacientes: 0,
    estoqueBaixo: 0,
    faturamentoDia: 0,
    filaEspera: 0,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      // Fazemos várias chamadas em paralelo para montar o dashboard
      const [resPacientes, resEstoque, resFinanceiro, resFila] =
        await Promise.all([
          api.get("/recepcao/pacientes"),
          api.get("/estoque"),
          api.get("/financeiro"),
          api.get("/recepcao/fila/triagem"), // Usando fila triagem como métrica de atividade
        ]);

      // Cálculos simples no front (idealmente seria no back)
      const estoqueBaixoCount = resEstoque.data.filter(
        (i) => i.qtdeAtual <= i.qtdeMinima
      ).length;

      // Soma faturamento (supondo que a dataLancamento seja hoje)
      // Aqui simplifiquei pegando o total geral para demonstração
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

      {/* Área de Gráficos / Avisos (Placeholder) */}
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
