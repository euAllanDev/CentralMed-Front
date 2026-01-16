"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Plus, Tag, Save } from "lucide-react";

export default function ProcedimentosTab() {
  const [procedimentos, setProcedimentos] = useState([]);
  const [novoProcedimento, setNovoProcedimento] = useState({ codigoTuss: "", descricao: "" });

  useEffect(() => {
    carregarProcedimentos();
  }, []);

  async function carregarProcedimentos() {
    try {
      const res = await api.get("/admin/procedimentos");
      setProcedimentos(res.data);
    } catch (error) { console.error("Erro ao carregar procedimentos:", error); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/admin/procedimentos", novoProcedimento);
      alert("Procedimento salvo!");
      setNovoProcedimento({ codigoTuss: "", descricao: "" });
      carregarProcedimentos();
    } catch (error) {
      alert("Erro ao salvar.");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-5 duration-300">
      {/* Formulário */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-700">
          <Plus size={20} /> Novo Procedimento
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500">Código TUSS *</label>
            <input type="text" placeholder="Ex: 10101012" className="w-full mt-1 border p-2 rounded bg-white text-gray-900"
              value={novoProcedimento.codigoTuss} onChange={(e) => setNovoProcedimento({ ...novoProcedimento, codigoTuss: e.target.value })} required />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500">Descrição *</label>
            <textarea rows="3" placeholder="Ex: Consulta em consultório..." className="w-full mt-1 border p-2 rounded bg-white text-gray-900"
              value={novoProcedimento.descricao} onChange={(e) => setNovoProcedimento({ ...novoProcedimento, descricao: e.target.value })} required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold flex justify-center items-center gap-2">
            <Save size={18}/> Salvar
          </button>
        </form>
      </div>

      {/* Tabela */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-4">Código TUSS</th>
                <th className="p-4">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {procedimentos.map((proc) => (
                <tr key={proc.id}>
                  <td className="p-4 font-mono font-bold text-blue-600">{proc.codigoTuss}</td>
                  <td className="p-4 text-gray-700">{proc.descricao}</td>
                </tr>
              ))}
              {procedimentos.length === 0 && <tr><td colSpan="2" className="p-8 text-center">Nenhum procedimento cadastrado.</td></tr>}
            </tbody>
        </table>
      </div>
    </div>
  );
}