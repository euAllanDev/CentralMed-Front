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
  });

  useEffect(() => {
    carregarEstoque();
  }, []);

  async function carregarEstoque() {
    try {
      const response = await api.get("/estoque");
      setItens(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCadastro(e) {
    e.preventDefault();
    try {
      await api.post("/estoque", novoItem);
      alert("Item cadastrado!");
      setNovoItem({ nome: "", qtdeAtual: "", qtdeMinima: "" });
      carregarEstoque();
    } catch (error) {
      alert("Erro ao cadastrar.");
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Controle de Estoque</h2>

      {/* Formulário */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-blue-600">
          <Plus size={20} /> Adicionar Novo Insumo
        </h3>
        <form
          onSubmit={handleCadastro}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Nome do Insumo (Ex: Luva Látex P)"
              className="w-full border p-2 rounded"
              value={novoItem.nome}
              onChange={(e) =>
                setNovoItem({ ...novoItem, nome: e.target.value })
              }
              required
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Qtd. Atual"
              className="w-full border p-2 rounded"
              value={novoItem.qtdeAtual}
              onChange={(e) =>
                setNovoItem({ ...novoItem, qtdeAtual: e.target.value })
              }
              required
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Qtd. Mínima"
              className="w-full border p-2 rounded"
              value={novoItem.qtdeMinima}
              onChange={(e) =>
                setNovoItem({ ...novoItem, qtdeMinima: e.target.value })
              }
              required
            />
          </div>
          <button
            type="submit"
            className="md:col-span-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-medium"
          >
            Salvar Insumo
          </button>
        </form>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Item</th>
              <th className="p-4">Qtd. Atual</th>
              <th className="p-4">Mínimo</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {itens.map((item) => {
              const critico = item.qtdeAtual <= item.qtdeMinima;
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-500">#{item.id}</td>
                  <td className="p-4 font-medium">{item.nome}</td>
                  <td className="p-4">{item.qtdeAtual}</td>
                  <td className="p-4 text-gray-500">{item.qtdeMinima}</td>
                  <td className="p-4">
                    {critico ? (
                      <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-bold w-fit">
                        <AlertCircle size={12} /> REPOR ESTOQUE
                      </span>
                    ) : (
                      <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
