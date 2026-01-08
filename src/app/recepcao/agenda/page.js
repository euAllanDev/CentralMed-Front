"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Calendar, Clock, CheckCircle, User } from "lucide-react";

export default function AgendaPage() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]); // Se tiver endpoint de médicos

  // Estado do Novo Agendamento
  const [novoAgendamento, setNovoAgendamento] = useState({
    data: new Date().toISOString().split("T")[0], // Hoje
    hora: "",
    paciente: { id: "" },
    medico: { id: 1 }, // Hardcoded por enquanto ou buscar lista
  });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      // Carrega pacientes para o select
      const resPacientes = await api.get("/recepcao/pacientes");
      setPacientes(resPacientes.data);

      // Carrega fila de triagem (como exemplo de agenda do dia)
      // O ideal seria um endpoint GET /recepcao/agenda?data=HJ, mas vamos usar a fila por enquanto
      // Se não tiver endpoint de listagem geral, você pode criar um mock ou ajustar o backend
      // Para este teste, vamos assumir que lista tudo ou usar um endpoint provisório
      // OBS: Backend atual tem /recepcao/fila/triagem. Vamos usar ele pra ver quem já fez checkin
      // Para ver agendados, precisamos do endpoint findByData (que criamos no repository mas talvez nao no controller)
      // Vamos focar em criar o agendamento primeiro.
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    }
  }

  async function handleAgendar(e) {
    e.preventDefault();
    try {
      const payload = {
        data: novoAgendamento.data,
        hora: novoAgendamento.hora,
        paciente: { id: novoAgendamento.paciente.id },
        medico: { id: 1 }, // ID Fixo simulando Dr. House
      };

      const response = await api.post("/recepcao/agendamentos", payload);
      alert("Agendado com sucesso!");

      // Adiciona na lista visualmente (simulação local pois faltou endpoint de listar agenda completa)
      setAgendamentos([...agendamentos, response.data]);
    } catch (error) {
      alert("Erro ao agendar.");
      console.error(error);
    }
  }

  async function handleCheckIn(id) {
    try {
      const response = await api.post(`/recepcao/agendamentos/${id}/checkin`);
      alert(`Check-in realizado! Senha: ${response.data.senhaPainel}`);
      // Atualiza status na lista local
      setAgendamentos((prev) =>
        prev.map((ag) =>
          ag.id === id ? { ...ag, status: "AGUARDANDO_TRIAGEM" } : ag
        )
      );
    } catch (error) {
      alert("Erro ao fazer check-in");
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Agenda e Check-in</h2>

      {/* Formulário de Agendamento */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-blue-500" /> Novo Agendamento
        </h3>
        <form
          onSubmit={handleAgendar}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Paciente</label>
            <select
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setNovoAgendamento({
                  ...novoAgendamento,
                  paciente: { id: e.target.value },
                })
              }
              required
            >
              <option value="">Selecione...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} - {p.cpf}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Data</label>
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={novoAgendamento.data}
              onChange={(e) =>
                setNovoAgendamento({ ...novoAgendamento, data: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Hora</label>
            <input
              type="time"
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setNovoAgendamento({ ...novoAgendamento, hora: e.target.value })
              }
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 md:col-span-4 font-semibold"
          >
            Agendar Paciente
          </button>
        </form>
      </div>

      {/* Lista de Agendamentos (Simulação visual do que foi criado agora) */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-gray-700 mb-4">
          Agendamentos Recentes
        </h3>
        {agendamentos.length === 0 ? (
          <p className="text-gray-400 text-sm">
            Nenhum agendamento feito nesta sessão.
          </p>
        ) : (
          <div className="space-y-3">
            {agendamentos.map((ag) => (
              <div
                key={ag.id}
                className="flex justify-between items-center p-3 border rounded bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">
                      {ag.paciente?.nome || "Paciente"}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> {ag.hora} - {ag.status}
                    </p>
                  </div>
                </div>

                {ag.status === "AGENDADO" && (
                  <button
                    onClick={() => handleCheckIn(ag.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle size={16} /> Confirmar Presença (Check-in)
                  </button>
                )}
                {ag.status === "AGUARDANDO_TRIAGEM" && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-bold">
                    Na Fila da Triagem
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
