"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Package, Plus, AlertCircle } from "lucide-react";

export default function EstoquePage() {
  const [itens, setItens] = useState([]);
  const [novoItem, setNovoItem] = useState({ 
    nome: "", 
    qtdeAtual: "", 
    qtdeMinima: "", 
    dataValidade: "" 
  });

  useEffect(() => {
    carregarEstoque();
  }, []);

  async function carregarEstoque() {
    try {
      const response = await api.get("/estoque");
      setItens(response.data);
    } catch (error) {
      console.error("Erro ao carregar estoque", error);
    }
  }

  async function handleCadastro(e) {
    e.preventDefault();
    try {
      await api.post("/estoque", novoItem);
      alert("Item cadastrado!");
      setNovoItem({ nome: "", qtdeAtual: "", qtdeMinima: "", dataValidade: "" });
      carregarEstoque();
    } catch (error) {
      alert("Erro ao cadastrar.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-blue-600" /> Controle de Estoque
        </h2>
      </div>

      {/* Formulário */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-sm uppercase">
          <Plus size={16} /> Adicionar Novo Insumo
        </h3>
        <form onSubmit={handleCadastro} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 mb-1 block">Nome do Item</label>
            <input
              type="text" placeholder="Ex: Luva Látex P"
              className="w-full border p-2 rounded focus:outline-blue-500"
              value={novoItem.nome}
              onChange={e => setNovoItem({...novoItem, nome: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Qtd. Atual</label>
            <input
              type="number" 
              className="w-full border p-2 rounded focus:outline-blue-500"
              value={novoItem.qtdeAtual}
              onChange={e => setNovoItem({...novoItem, qtdeAtual: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Mínimo</label>
            <input
              type="number" 
              className="w-full border p-2 rounded focus:outline-blue-500"
              value={novoItem.qtdeMinima}
              onChange={e => setNovoItem({...novoItem, qtdeMinima: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Validade (Anvisa)</label>
            <input
              type="date" 
              className="w-full border p-2 rounded focus:outline-blue-500"
              value={novoItem.dataValidade}
              onChange={e => setNovoItem({...novoItem, dataValidade: e.target.value})}
            />
          </div>
          <button type="submit" className="md:col-span-5 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 font-bold shadow-sm mt-2">
            Salvar no Estoque
          </button>
        </form>
      </div>

      {/* Tabela Inteligente */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="p-4 font-semibold">Item</th>
              <th className="p-4 font-semibold">Qtd. Atual</th>
              <th className="p-4 font-semibold">Validade</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {itens.map((item) => {
              // Lógica de Cores e Alertas
              const estoqueBaixo = item.qtdeAtual <= item.qtdeMinima;
              
              let statusValidade = <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">Válido</span>;
              let linhaStyle = "hover:bg-gray-50";

              if (item.dataValidade) {
                const hoje = new Date();
                const dataVal = new Date(item.dataValidade);
                const diffTime = dataVal - hoje;
                const diasParaVencer = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

                if (diasParaVencer < 0) {
                  statusValidade = <span className="text-red-700 bg-red-100 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><AlertCircle size={12}/> VENCIDO</span>;
                  linhaStyle = "bg-red-50 hover:bg-red-100";
                } else if (diasParaVencer < 30) {
                  statusValidade = <span className="text-orange-700 bg-orange-100 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><AlertCircle size={12}/> Vence em {diasParaVencer} dias</span>;
                }
              }

              return (
                <tr key={item.id} className={`${linhaStyle} transition-colors`}>
                  <td className="p-4 font-medium text-gray-800">
                    {item.nome}
                    {estoqueBaixo && (
                      <div className="text-[10px] text-red-500 font-bold mt-1">ESTOQUE BAIXO</div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={estoqueBaixo ? "text-red-600 font-bold" : "text-gray-700"}>
                      {item.qtdeAtual}
                    </span>
                    <span className="text-gray-400 text-xs ml-1">/ min {item.qtdeMinima}</span>
                  </td>
                  <td className="p-4 text-gray-600 font-mono text-xs">
                    {item.dataValidade ? new Date(item.dataValidade).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : "-"}
                  </td>
                  <td className="p-4">
                    {statusValidade}
                  </td>
                </tr>
              );
            })}
            {itens.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-gray-400">Estoque vazio.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}