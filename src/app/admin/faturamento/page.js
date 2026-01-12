"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { DollarSign, FileUp, Filter } from "lucide-react";

export default function FaturamentoPage() {
  const [guiasAbertas, setGuiasAbertas] = useState([]);
  const [guiasSelecionadas, setGuiasSelecionadas] = useState(new Set());
  const [filtroConvenio, setFiltroConvenio] = useState("TODOS");
  const [convenios, setConvenios] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [resGuias, resConvenios] = await Promise.all([
        api.get("/faturamento/guias-abertas"),
        api.get("/admin/convenios")
      ]);
      setGuiasAbertas(resGuias.data);
      setConvenios(resConvenios.data);
    } catch (error) {
      console.error(error);
    }
  }

  const handleSelectGuia = (id) => {
    const newSelection = new Set(guiasSelecionadas);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setGuiasSelecionadas(newSelection);
  };
  
  const faturarSelecionadas = async () => {
    if (guiasSelecionadas.size === 0) return alert("Selecione pelo menos uma guia.");
    
    try {
      await api.post("/faturamento/faturar-lote", Array.from(guiasSelecionadas));
      alert("Lote faturado com sucesso!");
      setGuiasSelecionadas(new Set());
      carregarDados();
    } catch(err) {
      alert("Erro ao faturar lote.");
    }
  }

  const guiasFiltradas = filtroConvenio === "TODOS" 
    ? guiasAbertas
    : guiasAbertas.filter(g => g.consulta.agendamento.paciente.convenio?.nome === filtroConvenio);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Faturamento de Convênios (TISS)</h2>
          <p className="text-gray-500 text-sm">Gere lotes de cobrança para os convênios.</p>
        </div>
        <button
            onClick={faturarSelecionadas}
            disabled={guiasSelecionadas.size === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
            <FileUp size={18}/> Faturar {guiasSelecionadas.size} Guias
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-4">
          <Filter size={16} className="text-gray-400"/>
          <select 
            className="border-gray-300 rounded"
            value={filtroConvenio}
            onChange={(e) => setFiltroConvenio(e.target.value)}
          >
            <option value="TODOS">Filtrar por Convênio: TODOS</option>
            {convenios.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
          </select>
          <span className="text-sm text-gray-500 ml-auto">{guiasFiltradas.length} guias para faturar</span>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
            <tr>
              <th className="p-4 w-12 text-center">Sel.</th>
              <th className="p-4">Paciente</th>
              <th className="p-4">Convênio</th>
              <th className="p-4">Data Atendimento</th>
              <th className="p-4">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {guiasFiltradas.map((guia) => (
              <tr key={guia.id} className="hover:bg-blue-50">
                <td className="p-4 text-center">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-gray-300"
                    checked={guiasSelecionadas.has(guia.id)}
                    onChange={() => handleSelectGuia(guia.id)}
                  />
                </td>
                <td className="p-4 font-bold">{guia.consulta.agendamento.paciente.nome}</td>
                <td className="p-4">{guia.consulta.agendamento.paciente.convenio?.nome}</td>
                <td className="p-4">{new Date(guia.consulta.dataHoraInicio).toLocaleDateString()}</td>
                <td className="p-4 font-mono">R$ {guia.valorConsulta.toFixed(2)}</td>
              </tr>
            ))}
            {guiasAbertas.length === 0 && (
                <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-400">Nenhuma guia em aberto. Tudo em dia! 🎉</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}