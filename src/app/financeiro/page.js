"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import {
  DollarSign,
  ArrowUpCircle,
  Clock,
  CreditCard,
  CheckCircle,
} from "lucide-react";

export default function FinanceiroPage() {
  const [abaAtiva, setAbaAtiva] = useState("pendentes"); // 'pendentes' ou 'historico'

  // Dados
  const [pendentes, setPendentes] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [totalCaixa, setTotalCaixa] = useState(0);

  // Modal de Pagamento
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState(null);
  const [formPagamento, setFormPagamento] = useState({
    valor: "250.00", // Valor padrão sugerido
    metodo: "Cartão de Crédito",
  });

  useEffect(() => {
    carregarDados();
  }, [abaAtiva]); // Recarrega ao trocar de aba

  async function carregarDados() {
    try {
      if (abaAtiva === "pendentes") {
        const res = await api.get("/financeiro/pendentes");
        setPendentes(res.data);
      } else {
        const res = await api.get("/financeiro");
        setHistorico(res.data);
        const total = res.data.reduce((acc, curr) => acc + curr.valor, 0);
        setTotalCaixa(total);
      }
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    }
  }

  async function processarPagamento(e) {
    e.preventDefault();
    if (!pagamentoSelecionado) return;

    try {
      await api.post("/financeiro/pagar", {
        consultaId: pagamentoSelecionado.id,
        valor: parseFloat(formPagamento.valor),
        formaPagamento: formPagamento.metodo,
      });

      alert("Pagamento registrado com sucesso!");
      setPagamentoSelecionado(null);
      carregarDados(); // Atualiza a lista
    } catch (error) {
      alert("Erro ao processar pagamento.");
      console.error(error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Financeiro</h2>

        {/* Toggle de Abas */}
        <div className="bg-gray-200 p-1 rounded-lg flex text-sm font-medium">
          <button
            onClick={() => setAbaAtiva("pendentes")}
            className={`px-4 py-2 rounded-md transition-all ${
              abaAtiva === "pendentes"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600"
            }`}
          >
            A Receber (Checkout)
          </button>
          <button
            onClick={() => setAbaAtiva("historico")}
            className={`px-4 py-2 rounded-md transition-all ${
              abaAtiva === "historico"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600"
            }`}
          >
            Histórico e Caixa
          </button>
        </div>
      </div>

      {/* --- ABA 1: PENDENTES (CHECKOUT) --- */}
      {abaAtiva === "pendentes" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lista de Pacientes Aguardando Pagamento */}
          <div className="md:col-span-2 space-y-4">
            {pendentes.length === 0 && (
              <div className="bg-white p-8 rounded-lg shadow text-center text-gray-400">
                <CheckCircle size={48} className="mx-auto mb-2 opacity-20" />
                <p>
                  Nenhuma conta pendente. Todos os atendimentos foram pagos.
                </p>
              </div>
            )}

            {pendentes.map((consulta) => (
              <div
                key={consulta.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-yellow-400 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-gray-800">
                    {consulta.agendamento.paciente.nome}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Médico:{" "}
                    {consulta.agendamento.medico?.nome || "Clínico Geral"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Finalizado em:{" "}
                    {new Date(consulta.dataHoraFim).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => setPagamentoSelecionado(consulta)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium flex items-center gap-2"
                >
                  <CreditCard size={18} /> Cobrar
                </button>
              </div>
            ))}
          </div>

          {/* Painel Lateral de Cobrança */}
          {pagamentoSelecionado && (
            <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-100 h-fit sticky top-4">
              <h3 className="font-bold text-lg mb-4 text-gray-700 border-b pb-2">
                Realizar Cobrança
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Paciente:{" "}
                <span className="font-bold text-gray-800">
                  {pagamentoSelecionado.agendamento.paciente.nome}
                </span>
              </p>

              <form onSubmit={processarPagamento} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Valor da Consulta (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none text-lg font-bold text-gray-700"
                    value={formPagamento.valor}
                    onChange={(e) =>
                      setFormPagamento({
                        ...formPagamento,
                        valor: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Forma de Pagamento
                  </label>
                  <select
                    className="w-full border p-2 rounded bg-white"
                    value={formPagamento.metodo}
                    onChange={(e) =>
                      setFormPagamento({
                        ...formPagamento,
                        metodo: e.target.value,
                      })
                    }
                  >
                    <option>Cartão de Crédito</option>
                    <option>Cartão de Débito</option>
                    <option>Dinheiro</option>
                    <option>PIX</option>
                    <option>Convênio (Guia)</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPagamentoSelecionado(null)}
                    className="flex-1 bg-gray-100 text-gray-600 py-2 rounded hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 font-bold"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* --- ABA 2: HISTÓRICO (O QUE JÁ TINHAMOS) --- */}
      {abaAtiva === "historico" && (
        <div className="space-y-6">
          <div className="bg-green-600 text-white p-6 rounded-lg shadow-md flex justify-between items-center max-w-md">
            <div>
              <p className="text-green-100 mb-1">Total em Caixa (Hoje)</p>
              <h3 className="text-3xl font-bold">R$ {totalCaixa.toFixed(2)}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <DollarSign size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Paciente</th>
                  <th className="p-4">Pagamento</th>
                  <th className="p-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {historico.map((lanc) => (
                  <tr key={lanc.id} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-500">#{lanc.id}</td>
                    <td className="p-4">
                      {new Date(lanc.dataLancamento).toLocaleString()}
                    </td>
                    <td className="p-4 font-medium">
                      {lanc.consulta?.agendamento?.paciente?.nome ||
                        "Paciente Removido"}
                    </td>
                    <td className="p-4 uppercase text-xs font-bold text-gray-600">
                      {lanc.formaPagamento}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-gray-800">
                      R$ {lanc.valor.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
