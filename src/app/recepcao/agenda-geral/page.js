"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalIcon,
  List,
  Plus,
} from "lucide-react";

export default function AgendaGeral() {
  const [visualizacao, setVisualizacao] = useState("CALENDARIO");
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diasComConsultas, setDiasComConsultas] = useState({});
  const [loading, setLoading] = useState(false);

  // Efeito que busca os dados da API sempre que o mês de visualização muda
  useEffect(() => {
    async function carregarResumoDoMes() {
      setLoading(true);
      try {
        const ano = mesAtual.getFullYear();
        const mes = mesAtual.getMonth() + 1; // API espera o mês de 1 a 12

        // Chama o endpoint do backend
        const response = await api.get(
          `/recepcao/agendamentos/resumo-mes?ano=${ano}&mes=${mes}`,
        );

        setDiasComConsultas(response.data || {});
      } catch (error) {
        console.error("Erro ao carregar resumo do mês", error);
        setDiasComConsultas({}); // Zera em caso de erro para não quebrar a tela
      } finally {
        setLoading(false);
      }
    }
    carregarResumoDoMes();
  }, [mesAtual]); // Dispara a função sempre que `mesAtual` for alterado

  // Funções de navegação do mês
  const proximoMes = () =>
    setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() + 1)));
  const mesAnterior = () =>
    setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() - 1)));

  // Função para gerar os dias do calendário (sem alteração)
  const diasDoMes = () => {
    /* ...seu código original aqui... */
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-full p-2">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Agenda Geral</h2>
          <p className="text-gray-500 text-sm">Gerencie agendamentos futuros</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-lg border shadow-sm">
          <button
            onClick={() => setVisualizacao("CALENDARIO")}
            className={`p-2 rounded ${visualizacao === "CALENDARIO" ? "bg-blue-100" : ""}`}
          >
            <CalIcon />
          </button>
          <button
            onClick={() => setVisualizacao("LISTA")}
            className={`p-2 rounded ${visualizacao === "LISTA" ? "bg-blue-100" : ""}`}
          >
            <List />
          </button>
        </div>
      </div>

      {/* Calendário */}
      {visualizacao === "CALENDARIO" && (
        <div
          className={`bg-white p-6 rounded-xl shadow-sm border ${loading ? "opacity-50" : ""}`}
        >
          {/* Navegação e Header (seu código original aqui) */}

          {/* Grid dos dias */}
          <div className="grid grid-cols-7 gap-2">
            {diasDoMes().map((dia, idx) => {
              if (!dia) return <div key={idx}></div>;

              // Lógica agora usa o estado `diasComConsultas`
              const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
              const qtd = diasComConsultas[dataStr] || 0;

              return (
                <div key={idx} className="h-24 border rounded-lg p-2 ...">
                  {/* JSX para exibir o dia e a quantidade (seu código original aqui) */}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visualização Lista (Texto) */}
      {visualizacao === "LISTA" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-4">
            Próximos Agendamentos
          </h3>
          <div className="space-y-4">
            {/* Mock de lista */}
            <div className="flex gap-4 border-l-4 border-blue-500 pl-4 py-2">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase">JAN</p>
                <p className="text-xl font-bold text-gray-800">15</p>
              </div>
              <div>
                <p className="font-bold text-gray-800">Maria da Silva</p>
                <p className="text-sm text-gray-500">
                  14:00 - Dr. House (Cardiologista)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
