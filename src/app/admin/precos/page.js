"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { DollarSign, Plus, Save } from "lucide-react";

export default function TabelaPrecosPage() {
  // Estados para carregar dados
  const [precos, setPrecos] = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [procedimentos, setProcedimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para o formulário
  const [novoPreco, setNovoPreco] = useState({
    convenioId: "",
    procedimentoId: "",
    valor: "",
  });

  // Carrega todos os dados necessários ao abrir a página
  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      const [resPrecos, resConvenios, resProcedimentos] = await Promise.all([
        api.get("/admin/precos"),
        api.get("/admin/convenios"),
        api.get("/admin/procedimentos"),
      ]);
      setPrecos(resPrecos.data || []);
      setConvenios(resConvenios.data || []);
      setProcedimentos(resProcedimentos.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados da página:", error);
    } finally {
      setLoading(false);
    }
  }

  // Função para salvar o novo preço
  async function handleSubmit(e) {
    e.preventDefault();
    if (
      !novoPreco.convenioId ||
      !novoPreco.procedimentoId ||
      !novoPreco.valor
    ) {
      return alert("Todos os campos são obrigatórios.");
    }

    // O backend espera objetos, não apenas IDs
    const payload = {
      convenio: { id: novoPreco.convenioId },
      procedimento: { id: novoPreco.procedimentoId },
      valor: novoPreco.valor,
    };

    try {
      await api.post("/admin/precos", payload);
      alert("Preço salvo com sucesso!");
      setNovoPreco({ convenioId: "", procedimentoId: "", valor: "" });
      carregarDados(); // Recarrega a lista
    } catch (err) {
      alert(
        "Erro ao salvar preço. A combinação Convênio + Procedimento pode já existir.",
      );
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Tabela de Preços por Convênio
        </h2>
        <p className="text-gray-500 text-sm">
          Defina o valor que cada convênio paga por procedimento.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-600">
            <Plus size={20} /> Associar Preço
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500">
                CONVÊNIO *
              </label>
              <select
                className="w-full mt-1 border p-2 rounded bg-white"
                value={novoPreco.convenioId}
                onChange={(e) =>
                  setNovoPreco({ ...novoPreco, convenioId: e.target.value })
                }
                required
              >
                <option value="">Selecione...</option>
                {convenios.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">
                PROCEDIMENTO *
              </label>
              <select
                className="w-full mt-1 border p-2 rounded bg-white"
                value={novoPreco.procedimentoId}
                onChange={(e) =>
                  setNovoPreco({ ...novoPreco, procedimentoId: e.target.value })
                }
                required
              >
                <option value="">Selecione...</option>
                {procedimentos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.descricao} ({p.codigoTuss})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">
                VALOR (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 120.00"
                className="w-full mt-1 border p-2 rounded"
                value={novoPreco.valor}
                onChange={(e) =>
                  setNovoPreco({ ...novoPreco, valor: e.target.value })
                }
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg flex justify-center items-center gap-2"
            >
              <Save size={18} /> Salvar Preço
            </button>
          </form>
        </div>

        {/* Tabela de Preços */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-4">Convênio</th>
                <th className="p-4">Procedimento</th>
                <th className="p-4">Código TUSS</th>
                <th className="p-4 text-right">Valor (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {precos.map((p) => (
                <tr key={p.id}>
                  <td className="p-4 font-bold">{p.convenio.nome}</td>
                  <td className="p-4 text-gray-600">
                    {p.procedimento.descricao}
                  </td>
                  <td className="p-4 font-mono text-blue-600">
                    {p.procedimento.codigoTuss}
                  </td>
                  <td className="p-4 text-right font-bold font-mono text-green-600">
                    {Number(p.valor).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
