"use client";

import { useState, useEffect } from "react";
import api from "@/services/api"; // O nosso conector com o Backend
import { Plus, Building, BookOpen, Save } from "lucide-react";

export default function ConveniosPage() {
  const [convenios, setConvenios] = useState([]); // Guarda a lista da tabela
  
  // Guarda o que é digitado no formulário
  const [form, setForm] = useState({ 
    nome: "", 
    cnpj: "", 
    registroAns: "" 
  });

  // 1. Quando a tela abre, busca os convênios que já existem
  useEffect(() => {
    carregarConvenios();
  }, []);

  async function carregarConvenios() {
    try {
      const response = await api.get("/convenios");
      setConvenios(response.data);
    } catch (error) {
      console.error("Erro ao buscar convênios", error);
      alert("Você não tem permissão ou o servidor está offline.");
    }
  }

  // 2. Quando clica no botão Salvar
  async function handleSalvar(e) {
    e.preventDefault(); // Impede a página de recarregar
    try {
      await api.post("/convenios", form);
      alert("Convênio salvo com sucesso!");
      
      // Limpa o formulário e recarrega a tabela
      setForm({ nome: "", cnpj: "", registroAns: "" });
      carregarConvenios();
    } catch (error) {
      alert("Erro ao salvar. Verifique se o Registro ANS já existe.");
    }
  }

  return (
    // Div principal com fundo cinza
    <div className="space-y-6 bg-gray-50 min-h-full p-2">
      
      {/* Header da Página */}
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen size={24}/> Gestão de Convênios (TISS)
          </h2>
          <p className="text-gray-500 text-sm">Cadastre os planos atendidos pela clínica.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Formulário na Esquerda */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h3 className="font-bold text-blue-600 mb-4 flex items-center gap-2"><Plus size={20}/> Novo Convênio</h3>
          <form onSubmit={handleSalvar} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nome *</label>
              <input type="text" placeholder="Ex: Unimed João Pessoa" className="w-full border p-2 rounded mt-1" 
                value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">CNPJ</label>
              <input type="text" placeholder="00.000.000/0000-00" className="w-full border p-2 rounded mt-1" 
                value={form.cnpj} onChange={e => setForm({...form, cnpj: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Registro ANS *</label>
              <input type="text" placeholder="Ex: 33964-8" className="w-full border p-2 rounded mt-1" 
                value={form.registroAns} onChange={e => setForm({...form, registroAns: e.target.value})} required />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2">
              <Save size={18}/> Salvar Convênio
            </button>
          </form>
        </div>

        {/* Tabela na Direita */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">Convênio</th>
                <th className="p-4">Registro ANS</th>
                <th className="p-4">CNPJ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {convenios.map(c => (
                <tr key={c.id}>
                  <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                    <Building size={16} className="text-blue-400"/> {c.nome}
                  </td>
                  <td className="p-4 font-mono text-gray-600">{c.registroAns}</td>
                  <td className="p-4 font-mono text-gray-600">{c.cnpj}</td>
                </tr>
              ))}
              {convenios.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-gray-400">Nenhum convênio cadastrado.</td></tr>}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}