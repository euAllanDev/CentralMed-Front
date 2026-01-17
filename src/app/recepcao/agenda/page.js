"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Clock, Activity, Stethoscope, PlusCircle, AlertTriangle } from "lucide-react";

// Componente auxiliar para a Badge de Prioridade
function BadgePrioridade({ tipo }) {
  if (tipo === "ALTA_PRIORIDADE") {
    return <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">PRIORIDADE MÁX</span>;
  }
  if (tipo === "PREFERENCIAL") {
    return <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full">PREFERENCIAL</span>;
  }
  return null;
}

export default function AgendaDoDia() {
  const [listaAgenda, setListaAgenda] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarAgenda();
    const intervalo = setInterval(carregarAgenda, 10000); // Atualiza a cada 10 segundos
    return () => clearInterval(intervalo);
  }, []);

  async function carregarAgenda() {
    try {
      setLoading(true);
      const [resTriagem, resMedico] = await Promise.all([
        api.get("/triagem/fila"),
        api.get("/medico/fila")
      ]);
      const tudo = [...(resTriagem.data || []), ...(resMedico.data || [])];
      
      // A ordenação já vem do backend, mas podemos garantir aqui
      setListaAgenda(tudo);
    } catch(err) {
      console.error("Erro ao carregar agenda", err)
    } finally {
      setLoading(false);
    }
  }

  const novoAgendamentoHoje = () => {
    alert("Funcionalidade para abrir o modal de 'Atendimento Imediato' seria implementada aqui.");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Fila do Dia</h2>
            <p className="text-gray-500 text-sm">Pacientes em atendimento na clínica agora.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={carregarAgenda} className="text-blue-600 font-semibold hover:bg-blue-50 px-4 py-2 rounded transition">
                Atualizar
            </button>
            <button onClick={novoAgendamentoHoje} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 flex items-center gap-2">
                <PlusCircle size={18} /> Novo Paciente Hoje
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando fila...</div>
        ) : listaAgenda.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="font-bold">Nenhum paciente na fila!</p>
            <p className="text-sm">Tudo tranquilo por enquanto.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold border-b">
              <tr>
                <th className="p-4">Hora Chegada</th>
                <th className="p-4">Senha</th>
                <th className="p-4">Paciente</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listaAgenda.map((ag) => (
                <tr key={ag.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-gray-600">{ag.hora.slice(0,5)}</td>
                  <td className="p-4"><span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md text-xs font-mono font-bold">{ag.senhaPainel}</span></td>
                  
                  {/* Célula do Paciente com Badges */}
                  <td className="p-4 font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      <span>{ag.paciente.nome}</span>
                      
                      {/* --- BADGE DE RETORNO (ADICIONADA AQUI) --- */}
                      {ag.isRetorno && (
                          <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              RETORNO
                          </span>
                      )}

                      {/* --- BADGE DE PRIORIDADE (ADICIONADA AQUI) --- */}
                      <BadgePrioridade tipo={ag.prioridade} />
                    </div>
                  </td>
                  
                  <td className="p-4">
                    {ag.status === 'AGUARDANDO_TRIAGEM' ? (
                        <span className="flex items-center gap-2 text-orange-700 bg-orange-100 w-fit px-3 py-1.5 rounded-full text-xs font-bold"><Activity size={14}/> Triagem</span>
                    ) : (
                        <span className="flex items-center gap-2 text-blue-700 bg-blue-100 w-fit px-3 py-1.5 rounded-full text-xs font-bold"><Stethoscope size={14}/> Médico</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}