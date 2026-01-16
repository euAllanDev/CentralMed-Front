"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Building, Plus, Save } from "lucide-react";

export default function ConveniosTab() {
  const [convenios, setConvenios] = useState([]);
  const [novoConvenio, setNovoConvenio] = useState({ nome: "", cnpj: "", registroAns: "" });

  useEffect(() => {
    carregarConvenios();
  }, []);

  async function carregarConvenios() {
    try {
      const res = await api.get("/admin/convenios");
      setConvenios(res.data);
    } catch (error) { console.error("Erro ao carregar convênios", error) }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/admin/convenios", novoConvenio);
      alert("Convênio salvo!");
      setNovoConvenio({ nome: "", cnpj: "", registroAns: "" });
      carregarConvenios();
    } catch (error) {
      alert("Erro ao salvar. Verifique se o Registro ANS já existe.");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-5 duration-300">
      {/* Formulário */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-700">
          <Plus size={20} /> Novo Convênio
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500">NOME *</label>
            <input type="text" placeholder="Ex: Unimed" className="w-full mt-1 border p-2 rounded focus:outline-blue-500 bg-white text-gray-900"
              value={novoConvenio.nome} onChange={(e) => setNovoConvenio({ ...novoConvenio, nome: e.target.value })} required />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500">CNPJ</label>
            <input type="text" placeholder="00.000.000/0000-00" className="w-full mt-1 border p-2 rounded bg-white text-gray-900"
              value={novoConvenio.cnpj} onChange={(e) => setNovoConvenio({ ...novoConvenio, cnpj: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500">REGISTRO ANS *</label>
            <input type="text" placeholder="Ex: 33964-8" className="w-full mt-1 border p-2 rounded bg-white text-gray-900"
              value={novoConvenio.registroAns} onChange={(e) => setNovoConvenio({ ...novoConvenio, registroAns: e.target.value })} required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center gap-2">
            <Save size={18}/> Salvar
          </button>
        </form>
      </div>

      {/* Tabela */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-4">Convênio</th>
                <th className="p-4">Registro ANS</th>
                <th className="p-4">CNPJ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {convenios.map((c) => (
                  <tr key={c.id}>
                      <td className="p-4 font-bold flex items-center gap-2"><Building size={14}/> {c.nome}</td>
                      <td className="p-4 font-mono">{c.registroAns}</td>
                      <td className="p-4 font-mono">{c.cnpj}</td>
                  </tr>
              ))}
              {convenios.length === 0 && <tr><td colSpan="3" className="p-8 text-center">Nenhum convênio cadastrado.</td></tr>}
            </tbody>
        </table>
      </div>
    </div>
  );
}