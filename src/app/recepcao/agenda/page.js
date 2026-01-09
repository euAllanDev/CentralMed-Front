"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Clock, Activity, Stethoscope, PlusCircle } from "lucide-react";

export default function AgendaDoDia() {
  const [listaAgenda, setListaAgenda] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega fila
  useEffect(() => {
    carregarAgenda();
  }, []);

  async function carregarAgenda() {
    try {
      setLoading(true);
      // Busca fila de triagem e fila de médico
      const [resTriagem, resMedico] = await Promise.all([
        api.get("/triagem/fila"),
        api.get("/medico/fila")
      ]);
      const tudo = [...resTriagem.data, ...resMedico.data];
      // Ordena por hora
      tudo.sort((a, b) => a.hora.localeCompare(b.hora));
      setListaAgenda(tudo);
    } finally {
      setLoading(false);
    }
  }

  // Função para adicionar agendamento hoje (Simplificada)
  const novoAgendamentoHoje = () => {
    // Aqui você pode redirecionar para o modal de agendamento ou abrir um modal local
    alert("Funcionalidade: Abrir modal de agendamento com data = HOJE pré-selecionada.");
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-full p-2">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Agenda do Dia</h2>
            <p className="text-gray-500 text-sm">Fila de espera e atendimentos em andamento</p>
        </div>
        <div className="flex gap-2">
            <button onClick={carregarAgenda} className="text-blue-600 font-semibold hover:bg-blue-50 px-4 py-2 rounded transition">
                Atualizar Lista
            </button>
            <button onClick={novoAgendamentoHoje} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 flex items-center gap-2">
                <PlusCircle size={18} /> Agendar para Hoje
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : listaAgenda.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p>Nenhum paciente na fila no momento.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold border-b">
              <tr>
                <th className="p-4">Chegada</th>
                <th className="p-4">Senha</th>
                <th className="p-4">Paciente</th>
                <th className="p-4">Status Atual</th>
                <th className="p-4">Prioridade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listaAgenda.map((ag) => (
                <tr key={ag.id} className="hover:bg-blue-50 transition-colors">
                  <td className="p-4 font-mono text-gray-600 font-bold">{ag.hora.slice(0,5)}</td>
                  <td className="p-4"><span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold">{ag.senhaPainel}</span></td>
                  <td className="p-4 font-medium text-gray-800">{ag.paciente.nome}</td>
                  <td className="p-4">
                    {ag.status === 'AGUARDANDO_TRIAGEM' ? (
                        <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 w-fit px-3 py-1 rounded-full text-xs font-bold"><Activity size={14}/> Triagem</span>
                    ) : (
                        <span className="flex items-center gap-1 text-blue-700 bg-blue-100 w-fit px-3 py-1 rounded-full text-xs font-bold"><Stethoscope size={14}/> Médico</span>
                    )}
                  </td>
                  <td className="p-4 text-xs font-bold text-gray-500">{ag.prioridade || "NORMAL"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}