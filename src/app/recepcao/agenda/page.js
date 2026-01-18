"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import {
  Clock,
  Activity,
  Stethoscope,
  User,
  RotateCw,
  PlusCircle,
  AlertCircle,
} from "lucide-react";

export default function AgendaDoDia() {
  const [listaAgenda, setListaAgenda] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // <-- 2. Instancie o Router

  // Carrega a fila quando a página abre e configura um "polling" para atualizar a cada 10s
  useEffect(() => {
    carregarAgenda(); // Carrega imediatamente
    const intervalId = setInterval(carregarAgenda, 10000); // Atualiza a cada 10 segundos
    return () => clearInterval(intervalId); // Limpa o loop ao sair da página
  }, []);

  async function carregarAgenda() {
    setLoading(true);
    try {
      // Faz todas as chamadas de API em paralelo para agilidade
      const [resFilaTriagem, resFilaMedico] = await Promise.all([
        api.get("/triagem/fila"),
        api.get("/medico/fila-completa"), // Usa o endpoint novo e completo
      ]);

      const filaMedicoCompleta = [
        ...(Array.isArray(resFilaMedico.data.minhaFila)
          ? resFilaMedico.data.minhaFila
          : []),
        ...(Array.isArray(resFilaMedico.data.filaGeral)
          ? resFilaMedico.data.filaGeral
          : []),
      ];

      const todaFila = [
        ...(Array.isArray(resFilaTriagem.data) ? resFilaTriagem.data : []),
        ...filaMedicoCompleta,
      ];

      // Ordena por hora para manter uma ordem cronológica visual
      todaFila.sort((a, b) => (a.hora || "").localeCompare(b.hora || ""));

      setListaAgenda(todaFila);
    } catch (err) {
      console.error("Erro ao buscar a fila do dia:", err);
    } finally {
      setLoading(false);
    }
  }

  const novoAgendamentoHoje = () => {
    router.push("/recepcao");
  };

  const StatusBadge = ({ status }) => {
    if (status === "AGUARDANDO_TRIAGEM") {
      return (
        <span className="flex items-center gap-1.5 text-orange-700 bg-orange-100 w-fit px-3 py-1 rounded-full text-xs font-bold">
          <Activity size={14} /> Triagem
        </span>
      );
    }
    if (status === "AGUARDANDO_CONSULTA") {
      return (
        <span className="flex items-center gap-1.5 text-blue-700 bg-blue-100 w-fit px-3 py-1 rounded-full text-xs font-bold">
          <Stethoscope size={14} /> Consultório
        </span>
      );
    }
    return <span className="bg-gray-100 text-gray-600 ...">{status}</span>;
  };

  const PrioridadeBadge = ({ tipo }) => {
    if (tipo === "ALTA_PRIORIDADE")
      return (
        <span className="flex items-center gap-1 text-red-700 font-bold w-fit">
          <AlertCircle size={14} /> ALTA
        </span>
      );
    if (tipo === "PREFERENCIAL")
      return (
        <span className="flex items-center gap-1 text-yellow-700 font-bold w-fit">
          <AlertCircle size={14} /> PREFERENCIAL
        </span>
      );
    return <span className="text-gray-500">NORMAL</span>;
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-full p-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Agenda do Dia</h2>
          <p className="text-gray-500">Fila de espera em tempo real</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={carregarAgenda}
            className="text-gray-500 font-semibold hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <RotateCw size={16} className={loading ? "animate-spin" : ""} />{" "}
            Atualizar
          </button>
          <button
            onClick={novoAgendamentoHoje}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusCircle size={18} /> Novo Agendamento
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && listaAgenda.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Carregando fila...
          </div>
        ) : listaAgenda.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="font-bold mb-1">Tudo tranquilo por aqui!</p>
            <p>Nenhum paciente na fila de espera no momento.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold border-b">
              <tr>
                <th className="p-4">Hora Chegada</th>
                <th className="p-4">Senha</th>
                <th className="p-4">Paciente</th>
                <th className="p-4">Status Atual</th>
                <th className="p-4">Prioridade</th>
                <th className="p-4">Destino (Médico)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listaAgenda.map((ag) => (
                <tr
                  key={ag.id}
                  className="hover:bg-blue-50/50 transition-colors text-sm"
                >
                  <td className="p-4 font-mono text-gray-600 font-bold">
                    {ag.hora?.slice(0, 5) || "-"}
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold">
                      {ag.senhaPainel}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                    <User size={16} className="text-gray-300" />
                    {ag.paciente.nome}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={ag.status} />
                  </td>
                  <td className="p-4 font-medium">
                    <PrioridadeBadge tipo={ag.prioridade} />
                  </td>
                  <td className="p-4 text-gray-600">
                    {ag.medico ? (
                      ag.medico.nome
                    ) : (
                      <span className="text-gray-400 font-normal">
                        Fila Geral
                      </span>
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
