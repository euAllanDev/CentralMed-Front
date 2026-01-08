"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import {
  Stethoscope,
  Check,
  AlertCircle,
  Printer,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function MedicoPage() {
  const [fila, setFila] = useState([]);
  const [pacienteEmAtendimento, setPacienteEmAtendimento] = useState(null);
  const [dadosTriagem, setDadosTriagem] = useState(null);
  const [consultaAtual, setConsultaAtual] = useState(null); // ID da consulta iniciada
  const [ultimoAtendimentoId, setUltimoAtendimentoId] = useState(null); // ID para impressão

  // Formulário do Médico
  const [formulario, setFormulario] = useState({
    anamnese: "",
    diagnosticoCid10: "",
    prescricao: "",
    insumosConsumidos: [],
  });

  useEffect(() => {
    carregarFila();
    const intervalo = setInterval(carregarFila, 5000);
    return () => clearInterval(intervalo);
  }, []);

  async function carregarFila() {
    try {
      const response = await api.get("/medico/fila");
      setFila(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function iniciarAtendimento(agendamento) {
    try {
      // Limpa estado de impressão anterior se houver
      setUltimoAtendimentoId(null);

      // 1. Busca dados da triagem
      const resTriagem = await api.get(
        `/medico/dados-triagem/${agendamento.id}`
      );
      setDadosTriagem(resTriagem.data);
      setPacienteEmAtendimento(agendamento);

      // 2. Avisa backend que começou
      const resConsulta = await api.post(
        `/medico/consulta/${agendamento.id}/iniciar`
      );
      setConsultaAtual(resConsulta.data.id);

      // Remove da fila visualmente
      setFila(fila.filter((f) => f.id !== agendamento.id));
    } catch (error) {
      alert("Erro ao iniciar atendimento.");
      console.error(error);
    }
  }

  async function finalizarConsulta(e) {
    e.preventDefault();
    try {
      await api.post(`/medico/consulta/${consultaAtual}/finalizar`, formulario);

      // Guarda o ID para mostrar botão de imprimir e a tela de sucesso
      setUltimoAtendimentoId(consultaAtual);

      alert("Consulta finalizada com sucesso!");

      // Limpa os estados do atendimento atual
      setPacienteEmAtendimento(null);
      setDadosTriagem(null);
      setFormulario({
        anamnese: "",
        diagnosticoCid10: "",
        prescricao: "",
        insumosConsumidos: [],
      });

      // Atualiza a fila
      carregarFila();
    } catch (error) {
      alert("Erro ao finalizar.");
      console.error(error);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
      {/* Coluna 1: Fila de Espera */}
      <div className="bg-white rounded-lg shadow-sm border p-4 overflow-y-auto">
        <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase">
          Fila de Espera
        </h3>
        <div className="space-y-2">
          {fila.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-gray-50 border rounded hover:bg-blue-50"
            >
              <p className="font-bold text-gray-800">{item.paciente.nome}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {item.senhaPainel}
                </span>
                <button
                  onClick={() => iniciarAtendimento(item)}
                  className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                >
                  Chamar
                </button>
              </div>
            </div>
          ))}
          {fila.length === 0 && (
            <p className="text-gray-400 text-xs">Nenhum paciente aguardando.</p>
          )}
        </div>
      </div>

      {/* Coluna 2-4: Área Principal (Variável) */}
      <div className="md:col-span-3 bg-white rounded-lg shadow-sm border p-6 overflow-y-auto">
        {/* ESTADO 1: ATENDIMENTO FINALIZADO (Mostrar Botão Imprimir) */}
        {!pacienteEmAtendimento && ultimoAtendimentoId && (
          <div className="h-full flex flex-col items-center justify-center animate-fade-in">
            <div className="bg-green-50 border border-green-200 p-8 rounded-xl text-center shadow-sm max-w-lg">
              <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Atendimento Finalizado!
              </h2>
              <p className="text-green-700 mb-6">
                O registro foi salvo no prontuário e o estoque atualizado.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/impressao/receita/${ultimoAtendimentoId}`}
                  target="_blank" // Abre em nova aba
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 shadow transition-transform hover:scale-105 font-semibold"
                >
                  <Printer size={20} /> Imprimir Receita
                </Link>

                <button
                  onClick={() => setUltimoAtendimentoId(null)}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Voltar para Fila
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ESTADO 2: AGUARDANDO (Nenhum paciente selecionado e sem finalização recente) */}
        {!pacienteEmAtendimento && !ultimoAtendimentoId && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Stethoscope size={64} className="mb-4 opacity-30" />
            <p className="text-lg">Aguardando início de atendimento...</p>
            <p className="text-sm">
              Chame o próximo paciente na fila à esquerda.
            </p>
          </div>
        )}

        {/* ESTADO 3: EM ATENDIMENTO (Formulário Ativo) */}
        {pacienteEmAtendimento && (
          <div className="space-y-6">
            {/* Cabeçalho Paciente */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {pacienteEmAtendimento.paciente.nome}
                </h1>
                <p className="text-gray-500">
                  Convênio: {pacienteEmAtendimento.paciente.convenio}
                </p>
              </div>
              <div className="text-right">
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                  EM ATENDIMENTO
                </span>
              </div>
            </div>

            {/* Dados da Triagem (Read Only) */}
            {dadosTriagem && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} /> Dados da Triagem (Enfermeiro)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <p>
                    <strong>Peso:</strong> {dadosTriagem.peso} kg
                  </p>
                  <p>
                    <strong>Pressão:</strong> {dadosTriagem.pressao}
                  </p>
                  <p>
                    <strong>Temp:</strong> {dadosTriagem.temperatura}°C
                  </p>
                  <p>
                    <strong>Saturação:</strong> {dadosTriagem.saturacao}%
                  </p>
                  <p className="col-span-4">
                    <strong>Obs:</strong> {dadosTriagem.observacoes}
                  </p>
                </div>
              </div>
            )}

            {/* Formulário Médico */}
            <form onSubmit={finalizarConsulta} className="space-y-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Anamnese / Evolução
                </label>
                <textarea
                  className="w-full border p-3 rounded h-32 focus:ring-2 ring-blue-500 outline-none"
                  placeholder="Descreva os sintomas e histórico..."
                  value={formulario.anamnese}
                  onChange={(e) =>
                    setFormulario({ ...formulario, anamnese: e.target.value })
                  }
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Diagnóstico (CID-10)
                  </label>
                  <input
                    type="text"
                    className="w-full border p-2 rounded"
                    placeholder="Ex: J00"
                    value={formulario.diagnosticoCid10}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        diagnosticoCid10: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Prescrição Médica
                </label>
                <textarea
                  className="w-full border p-3 rounded h-32 focus:ring-2 ring-blue-500 outline-none"
                  placeholder="Medicamentos e posologia..."
                  value={formulario.prescricao}
                  onChange={(e) =>
                    setFormulario({ ...formulario, prescricao: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPacienteEmAtendimento(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <Check size={20} /> Finalizar Atendimento
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
