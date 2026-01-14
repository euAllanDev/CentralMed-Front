"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { FileText, Clock, CheckCircle } from "lucide-react";

export default function NotasFiscaisPage() {
  const [pendentes, setPendentes] = useState([]);
  const [emitidas, setEmitidas] = useState([]);
  const [aba, setAba] = useState("PENDENTES");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [resPendentes, resEmitidas] = await Promise.all([
        api.get("/notas-fiscais/pendentes/particular"),
        api.get("/notas-fiscais"),
      ]);
      setPendentes(resPendentes.data || []);
      setEmitidas(resEmitidas.data || []);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar dados. Verifique permissões.");
    }
  }

  async function emitirNota(id) {
    if (!confirm("Deseja realmente emitir a NFS-e para este pagamento?")) return;
    
    try {
        await api.post(`/notas-fiscais/emitir/particular/${id}`);
        alert("Nota Fiscal emitida com sucesso! (Simulação)");
        carregarDados(); // Recarrega as listas
    } catch(err) {
        alert("Falha ao emitir nota fiscal.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Emissão de Notas Fiscais (NFS-e)</h2>
        <p className="text-gray-500 text-sm">Gerencie a emissão para consultas particulares.</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          <button onClick={() => setAba("PENDENTES")} className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${aba === "PENDENTES" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <Clock size={16}/> Pagamentos a Emitir ({pendentes.length})
          </button>
          <button onClick={() => setAba("EMITIDAS")} className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${aba === "EMITIDAS" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <CheckCircle size={16}/> Histórico de Emissões ({emitidas.length})
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {aba === "PENDENTES" && (
          <TabelaPendentes pendentes={pendentes} onEmitir={emitirNota} />
        )}
        {aba === "EMITIDAS" && (
          <TabelaEmitidas emitidas={emitidas} />
        )}
      </div>
    </div>
  );
}

// Tabela de Lançamentos Pendentes
function TabelaPendentes({ pendentes, onEmitir }) {
  if (!Array.isArray(pendentes)) return <p className="p-4">Carregando...</p>;

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-gray-50 text-gray-600">
        <tr>
          <th className="p-4">Data Pag.</th>
          <th className="p-4">Paciente</th>
          <th className="p-4 font-mono text-right">Valor</th>
          <th className="p-4 text-center">Ação</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {pendentes.map((lanc) => (
          <tr key={lanc.id}>
            <td className="p-4">{new Date(lanc.dataLancamento).toLocaleDateString()}</td>
            <td className="p-4 font-bold">{lanc.consulta.agendamento.paciente.nome}</td>
            <td className="p-4 font-mono text-right">R$ {lanc.valor.toFixed(2)}</td>
            <td className="p-4 text-center">
              <button onClick={() => onEmitir(lanc.id)} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-blue-700">
                Emitir NF
              </button>
            </td>
          </tr>
        ))}
        {pendentes.length === 0 && (
          <tr><td colSpan="4" className="p-8 text-center text-gray-400">Nenhum pagamento particular pendente.</td></tr>
        )}
      </tbody>
    </table>
  );
}

// Tabela de Notas já Emitidas
function TabelaEmitidas({ emitidas }) {
    if (!Array.isArray(emitidas)) return <p className="p-4">Carregando...</p>;

    return (
    <table className="w-full text-left text-sm">
      <thead className="bg-gray-50 text-gray-600">
        <tr>
          <th className="p-4">Nº Nota</th>
          <th className="p-4">Emissão</th>
          <th className="p-4">Paciente</th>
          <th className="p-4 font-mono text-right">Valor</th>
          <th className="p-4">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {emitidas.map((nf) => (
          <tr key={nf.id}>
            <td className="p-4 font-mono text-blue-600 font-bold">{nf.numero}</td>
            <td className="p-4">{new Date(nf.dataEmissao).toLocaleString()}</td>
            <td className="p-4">{nf.lancamentoFinanceiro?.consulta.agendamento.paciente.nome}</td>
            <td className="p-4 font-mono text-right">R$ {nf.valor.toFixed(2)}</td>
            <td className="p-4"><span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">{nf.status}</span></td>
          </tr>
        ))}
        {emitidas.length === 0 && (
          <tr><td colSpan="5" className="p-8 text-center text-gray-400">Nenhuma nota emitida.</td></tr>
        )}
      </tbody>
    </table>
  );
}