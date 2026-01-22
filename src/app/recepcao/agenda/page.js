"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import {
  Clock,
  User,
  RotateCw,
  PlusCircle,
  Activity,
  Stethoscope,
} from "lucide-react";

export default function AgendaDoDia() {
  const [filaCompleta, setFilaCompleta] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    carregarFila(); // Carrega na primeira vez
    const intervalId = setInterval(carregarFila, 10000); // Atualiza a cada 10 segundos
    return () => clearInterval(intervalId); // Limpa o "timer" ao sair da página
  }, []);

  async function carregarFila() {
    setLoading(true);
    try {
      // Faz as duas chamadas em paralelo
      const [resFilaTriagem, resFilasMedicas] = await Promise.all([
        api.get("/triagem/fila"),
        api.get("/medico/fila-completa"),
      ]);

      const triagem = Array.isArray(resFilaTriagem.data)
        ? resFilaTriagem.data
        : [];
      const medicosDirecionada = Array.isArray(resFilasMedicas.data.minhaFila)
        ? resFilasMedicas.data.minhaFila
        : [];
      const medicosGeral = Array.isArray(resFilasMedicas.data.filaGeral)
        ? resFilasMedicas.data.filaGeral
        : [];

      const todaFila = [...triagem, ...medicosDirecionada, ...medicosGeral];

      // Ordena por hora para manter uma visão cronológica
      todaFila.sort((a, b) => (a.hora || "").localeCompare(b.hora || ""));

      setFilaCompleta(todaFila);
    } catch (err) {
      console.error("Erro ao buscar a fila do dia:", err);
      setFilaCompleta([]); // Zera em caso de erro
    } finally {
      setLoading(false);
    }
  }

  const novoAgendamentoHoje = () => {
    router.push("/recepcao"); // Leva para o painel principal
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
    return (
      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-full p-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Fila de Atendimento
          </h2>
          <p className="text-gray-500 text-sm">
            Pacientes aguardando atendimento hoje
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={carregarFila}
            className="text-gray-500 font-semibold hover:bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <RotateCw size={16} className={loading ? "animate-spin" : ""} />{" "}
            Atualizar
          </button>
          <button
            onClick={novoAgendamentoHoje}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusCircle size={18} /> Novo Atendimento
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && filaCompleta.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Carregando fila...
          </div>
        ) : filaCompleta.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="font-bold text-lg mb-1">Tudo calmo por aqui!</p>
            <p>Nenhum paciente na fila no momento.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Chegada</th>
                <th className="p-4">Senha</th>
                <th className="p-4">Paciente</th>
                <th className="p-4">Status Atual</th>
                <th className="p-4">Destino</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filaCompleta.map((ag) => (
                <tr key={ag.id} className="hover:bg-blue-50/50">
                  <td className="p-4 font-mono text-gray-600 font-bold">
                    {ag.hora?.slice(0, 5) || "-"}
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded font-bold">
                      {ag.senhaPainel}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                    <User size={16} />
                    {ag.paciente.nome}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={ag.status} />
                  </td>
                  <td className="p-4 text-gray-600">
                    {ag.medico ? (
                      ag.medico.nome
                    ) : (
                      <span className="text-gray-400">Fila Geral</span>
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
