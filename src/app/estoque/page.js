"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Package, Plus, AlertCircle, Tag, AlertTriangle, Save } from "lucide-react";

export default function EstoquePage() {
  const [itens, setItens] = useState([]);
  
  const [novoItem, setNovoItem] = useState({
    nome: "",
    qtdeMinima: "",
    quantidade: "",
    numeroLote: "",
    dataValidade: ""
  });

  useEffect(() => {
    carregarEstoque();
  }, []);

  async function carregarEstoque() {
    try {
      const response = await api.get("/estoque");
      if (Array.isArray(response.data)) {
        setItens(response.data);
      } else {
        setItens([]); 
      }
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
      setItens([]);
    }
  }

  async function handleCadastro(e) {
    e.preventDefault();
    try {
      await api.post("/estoque", novoItem);
      alert("Insumo e Lote cadastrados com sucesso!");
      
      setNovoItem({ 
        nome: "", qtdeMinima: "", 
        quantidade: "", numeroLote: "", dataValidade: "" 
      });
      
      carregarEstoque();
    } catch (error) {
      alert("Erro ao cadastrar. Verifique os dados.");
    }
  }

  const getStatusValidade = (lotes) => {
    if (!lotes || lotes.length === 0) return null;
    
    const loteMaisAntigo = [...lotes]
        .filter(l => l.quantidade > 0) // Considera apenas lotes com estoque
        .sort((a, b) => new Date(a.dataValidade) - new Date(b.dataValidade))[0];

    if (!loteMaisAntigo) return null; // Nenhum lote com estoque

    const dataVenc = new Date(loteMaisAntigo.dataValidade);
    const hoje = new Date();
    // Adiciona 1 dia para incluir o dia atual na contagem
    const diferencaDias = Math.ceil((dataVenc - hoje) / (1000 * 60 * 60 * 24)) + 1;

    if (diferencaDias <= 0) return { cor: "red", texto: "VENCIDO", data: dataVenc, lote: loteMaisAntigo.numeroLote };
    if (diferencaDias <= 30) return { cor: "orange", texto: "Vence em breve", data: dataVenc, lote: loteMaisAntigo.numeroLote };
    return { cor: "green", texto: "Validade OK", data: dataVenc, lote: loteMaisAntigo.numeroLote };
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-full p-2">
      
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Controle de Estoque (FEFO)</h2>
          <p className="text-gray-500 text-sm">Gerenciamento por Lote e Validade (Anvisa).</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-600">
          <Plus size={20} /> Entrada de Nota / Novo Item
        </h3>
        <form onSubmit={handleCadastro} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nome do Produto</label>
                <input type="text" placeholder="Ex: Dipirona 500mg" className="w-full border p-2 rounded focus:outline-blue-500 text-gray-800"
                value={novoItem.nome} onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })} required />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Estoque Mínimo (Alerta)</label>
                <input type="number" placeholder="Ex: 50" className="w-full border p-2 rounded focus:outline-blue-500 text-gray-800"
                value={novoItem.qtdeMinima} onChange={(e) => setNovoItem({ ...novoItem, qtdeMinima: e.target.value })} required />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
                <p className="text-xs font-bold text-blue-600 uppercase mb-2 flex items-center gap-1">
                    <Tag size={14}/> Dados do Lote Inicial
                </p>
            </div>
            <div>
                <label className="text-xs text-gray-500 block mb-1">Número do Lote</label>
                <input type="text" placeholder="Ex: L-2026/A" className="w-full border p-2 rounded bg-white text-gray-800"
                value={novoItem.numeroLote} onChange={(e) => setNovoItem({ ...novoItem, numeroLote: e.target.value })} required />
            </div>
            <div>
                <label className="text-xs text-gray-500 block mb-1">Validade</label>
                <input type="date" className="w-full border p-2 rounded bg-white text-gray-800"
                value={novoItem.dataValidade} onChange={(e) => setNovoItem({ ...novoItem, dataValidade: e.target.value })} required />
            </div>
            <div>
                <label className="text-xs text-gray-500 block mb-1">Quantidade</label>
                <input type="number" placeholder="Qtd. Entrada" className="w-full border p-2 rounded bg-white text-gray-800"
                value={novoItem.quantidade} onChange={(e) => setNovoItem({ ...novoItem, quantidade: e.target.value })} required />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md flex justify-center gap-2">
            <Save size={18} /> Registrar Entrada
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
            <tr>
              <th className="p-4">Produto</th>
              <th className="p-4">Total em Estoque</th>
              <th className="p-4">Próximo Vencimento (FEFO)</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.isArray(itens) && itens.map((item) => {
              const total = item.lotes ? item.lotes.reduce((acc, l) => acc + l.quantidade, 0) : 0;
              const statusValidade = getStatusValidade(item.lotes);
              const precisaRepor = total <= item.qtdeMinima;
              const estaOk = !precisaRepor && (!statusValidade || statusValidade.cor === 'green');

              return (
                <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                  <td className="p-4 font-bold text-gray-800">{item.nome}</td>
                  
                  <td className="p-4">
                    <span className="font-mono text-base">{total}</span>
                    {precisaRepor && (
                        <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">BAIXO</span>
                    )}
                  </td>

                  <td className="p-4">
                    {statusValidade ? (
                        <div className="flex flex-col">
                            <span className="font-mono text-gray-700">
                                {statusValidade.data.toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                            </span>
                            <span className="text-[10px] text-gray-400">Lote: {statusValidade.lote}</span>
                        </div>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                        {precisaRepor && (
                            <span title="Repor Estoque" className="flex items-center gap-1 text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded text-xs font-bold w-fit">
                                <AlertCircle size={14} /> REPOR
                            </span>
                        )}
                        {statusValidade && statusValidade.cor !== 'green' && (
                            <span title="Verificar Validade" className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold w-fit border ${
                                statusValidade.cor === 'red' ? 'text-red-700 bg-red-100 border-red-200' : 'text-orange-700 bg-orange-100 border-orange-200'
                            }`}>
                                <AlertTriangle size={14} /> {statusValidade.texto}
                            </span>
                        )}
                        {estaOk && (
                             <span className="text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded text-xs font-bold">OK</span>
                        )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {(!Array.isArray(itens) || itens.length === 0) && (
                <tr>
                    <td colSpan="4" className="p-12 text-center text-gray-400">
                        Nenhum item cadastrado.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}