"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Calendar, Clock, CheckCircle, User, Stethoscope, Activity } from "lucide-react";

export default function AgendaPage() {
  const [listaAgenda, setListaAgenda] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarAgendaDoDia();
  }, []);

  async function carregarAgendaDoDia() {
    try {
      setLoading(true);
      // Backend ainda não tem um endpoint "Agenda Geral", então vamos combinar as filas para visualizar
      // Idealmente: Criar endpoint GET /recepcao/agendamentos?data=hoje
      
      const [resTriagem, resMedico] = await Promise.all([
        api.get("/triagem/fila"), // Status: AGUARDANDO_TRIAGEM
        api.get("/medico/fila")   // Status: AGUARDANDO_CONSULTA
      ]);

      // Junta tudo numa lista só
      const tudo = [...resTriagem.data, ...resMedico.data];
      
      // Ordena por hora
      tudo.sort((a, b) => a.hora.localeCompare(b.hora));

      setListaAgenda(tudo);
    } catch (error) {
      console.error("Erro ao carregar agenda", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Visão Geral do Dia</h2>
        <button onClick={carregarAgendaDoDia} className="text-blue-600 text-sm hover:underline">Atualizar</button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        {loading ? (
          <p className="p-4 text-center text-gray-500">Carregando agenda...</p>
        ) : listaAgenda.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Calendar size={48} className="mx-auto mb-3 opacity-20" />
            <p>Nenhum paciente na fila de atendimento hoje.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {listaAgenda.map((ag) => (
              <div key={ag.id} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    ag.status === 'AGUARDANDO_TRIAGEM' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {ag.status === 'AGUARDANDO_TRIAGEM' ? <Activity size={20} /> : <Stethoscope size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{ag.paciente.nome}</p>
                    <div className="flex gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Clock size={14} /> {ag.hora}</span>
                      <span className="font-mono bg-gray-100 px-2 rounded text-xs py-0.5">{ag.senhaPainel}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  {ag.status === 'AGUARDANDO_TRIAGEM' && (
                     <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-bold border border-yellow-200">
                       Na Triagem
                     </span>
                  )}
                  {ag.status === 'AGUARDANDO_CONSULTA' && (
                     <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold border border-blue-200">
                       Aguardando Médico
                     </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}