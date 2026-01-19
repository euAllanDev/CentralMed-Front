"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import {
  Activity,
  ClipboardList,
  Save,
  Bell,
  User,
  Thermometer,
  Heart,
  Scale,
  Ruler,
  Wind,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function TriagemPage() {
  const [fila, setFila] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [loadingChamar, setLoadingChamar] = useState(null); // ID do paciente sendo chamado
  const [loadingSalvar, setLoadingSalvar] = useState(false);

  // Estado do formulário
  const [dadosTriagem, setDadosTriagem] = useState({
    peso: "",
    altura: "",
    pressao: "",
    temperatura: "",
    saturacao: "",
    observacoes: "",
    enfermeiroId: 2, // Idealmente viria do contexto de autenticação
  });

  // Polling para atualizar a fila a cada 5 segundos
  useEffect(() => {
    carregarFila();
    const intervalo = setInterval(carregarFila, 5000);
    return () => clearInterval(intervalo);
  }, []);

  async function carregarFila() {
    try {
      const response = await api.get("/triagem/fila");
      setFila(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erro ao carregar fila", error);
    }
  }

  // Ação do Botão "CHAMAR"
  async function handleChamarPaciente(agendamento) {
    if (!agendamento) return;

    // Define qual ID está carregando para mostrar o spinner apenas no botão correto
    setLoadingChamar(agendamento.id);

    try {
      // 1. Prepara a UI (seleciona o paciente e limpa form)
      setPacienteSelecionado(agendamento);
      setDadosTriagem({
        peso: "",
        altura: "",
        pressao: "",
        temperatura: "",
        saturacao: "",
        observacoes: "",
        enfermeiroId: 2,
      });

      // 2. Chama a API do Painel/TV
      await api.post(`/triagem/chamar/${agendamento.id}`);
    } catch (error) {
      console.warn(
        "Erro ao chamar no painel, mas seguindo com atendimento.",
        error,
      );
      // Opcional: Toast de aviso
    } finally {
      setLoadingChamar(null);
    }
  }

  async function salvarTriagem(e) {
    e.preventDefault();
    if (!pacienteSelecionado) return;

    setLoadingSalvar(true);
    try {
      await api.post(`/triagem/${pacienteSelecionado.id}`, dadosTriagem);

      // Sucesso
      alert("Triagem finalizada com sucesso!");
      setPacienteSelecionado(null);
      carregarFila(); // Atualiza fila imediatamente
    } catch (error) {
      alert("Erro ao salvar triagem. Verifique os dados.");
      console.error(error);
    } finally {
      setLoadingSalvar(false);
    }
  }

  // Componente visual de prioridade
  function BadgePrioridade({ tipo }) {
    const configs = {
      ALTA_PRIORIDADE: {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "PRIORIDADE MÁXIMA",
      },
      PREFERENCIAL: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        label: "PREFERENCIAL",
      },
      NORMAL: { bg: "bg-blue-50", text: "text-blue-600", label: "NORMAL" },
    };

    const style = configs[tipo] || configs["NORMAL"];

    return (
      <span
        className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border border-transparent ${style.bg} ${style.text}`}
      >
        {style.label}
      </span>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header da Página */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">
              Triagem de Enfermagem
            </h1>
            <p className="text-sm text-gray-500">
              Avaliação de sinais vitais e classificação de risco
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
          {/* --- COLUNA DA ESQUERDA: FILA --- */}
          <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <ClipboardList size={18} className="text-blue-500" />
                Fila de Espera
              </h3>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                {fila.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 custom-scrollbar">
              {fila.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                  <Clock size={40} className="mb-2 opacity-20" />
                  <p className="text-sm">Nenhum paciente aguardando.</p>
                </div>
              ) : (
                fila.map((item) => {
                  const isSelected = pacienteSelecionado?.id === item.id;
                  const isLoading = loadingChamar === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`relative p-4 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? "bg-white border-blue-500 shadow-md ring-1 ring-blue-500 z-10"
                          : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-2xl font-mono font-bold text-gray-800 tracking-tight">
                          {item.senhaPainel}
                        </span>
                        <BadgePrioridade tipo={item.prioridade} />
                      </div>

                      <div className="mb-4">
                        <p className="font-semibold text-gray-700 truncate">
                          {item.paciente.nome}
                        </p>
                        <p className="text-xs text-gray-500">
                          Chegada:{" "}
                          {new Date().toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          h
                        </p>
                      </div>

                      {/* BOTÃO CHAMAR - Substitui o clique no card */}
                      <button
                        onClick={() => handleChamarPaciente(item)}
                        disabled={isLoading || isSelected}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all ${
                          isSelected
                            ? "bg-green-100 text-green-700 cursor-default"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-lg active:translate-y-0.5"
                        }`}
                      >
                        {isLoading ? (
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        ) : isSelected ? (
                          <>
                            <CheckCircle size={16} /> EM ATENDIMENTO
                          </>
                        ) : (
                          <>
                            <Bell size={16} /> CHAMAR PACIENTE
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* --- COLUNA DA DIREITA: FORMULÁRIO --- */}
          <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {!pacienteSelecionado ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 bg-gray-50/30">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <Activity size={48} className="text-gray-300" />
                </div>
                <h2 className="text-xl font-semibold text-gray-600">
                  Área de Atendimento
                </h2>
                <p className="text-gray-400 mt-2 max-w-sm text-center">
                  Clique no botão "Chamar" em um paciente da fila para iniciar a
                  coleta de sinais vitais.
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Cabeçalho do Paciente */}
                <div className="bg-blue-50/50 p-6 border-b border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                      <User size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                        {pacienteSelecionado.paciente.nome}
                      </h2>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">CPF:</span>{" "}
                          {pacienteSelecionado.paciente.cpf}
                        </span>
                        <span className="w-px h-4 bg-gray-300"></span>
                        <span className="flex items-center gap-1">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">Convênio:</span>{" "}
                            {pacienteSelecionado.paciente.convenio?.nome ||
                              "Particular"}
                          </span>
                        </span>
                        <span className="w-px h-4 bg-gray-300"></span>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-medium">
                          {pacienteSelecionado.tipoAtendimento || "Consulta"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formulário Scrollável */}
                <form
                  onSubmit={salvarTriagem}
                  className="flex-1 overflow-y-auto p-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Input com Ícone */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Peso (kg)
                      </label>
                      <div className="relative group">
                        <Scale
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500"
                          size={18}
                        />
                        <input
                          type="number"
                          step="0.1"
                          placeholder="00.0"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          value={dadosTriagem.peso}
                          onChange={(e) =>
                            setDadosTriagem({
                              ...dadosTriagem,
                              peso: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Altura (m)
                      </label>
                      <div className="relative group">
                        <Ruler
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500"
                          size={18}
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="1.75"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          value={dadosTriagem.altura}
                          onChange={(e) =>
                            setDadosTriagem({
                              ...dadosTriagem,
                              altura: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Pressão Arterial
                      </label>
                      <div className="relative group">
                        <Heart
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500"
                          size={18}
                        />
                        <input
                          type="text"
                          placeholder="120/80"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          value={dadosTriagem.pressao}
                          onChange={(e) =>
                            setDadosTriagem({
                              ...dadosTriagem,
                              pressao: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Temperatura (°C)
                      </label>
                      <div className="relative group">
                        <Thermometer
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500"
                          size={18}
                        />
                        <input
                          type="number"
                          step="0.1"
                          placeholder="36.5"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          value={dadosTriagem.temperatura}
                          onChange={(e) =>
                            setDadosTriagem({
                              ...dadosTriagem,
                              temperatura: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Saturação O₂ (%)
                      </label>
                      <div className="relative group">
                        <Wind
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500"
                          size={18}
                        />
                        <input
                          type="number"
                          placeholder="98"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          value={dadosTriagem.saturacao}
                          onChange={(e) =>
                            setDadosTriagem({
                              ...dadosTriagem,
                              saturacao: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 mb-8">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <AlertCircle size={14} /> Observações & Queixa Principal
                    </label>
                    <textarea
                      placeholder="Descreva os sintomas relatados pelo paciente..."
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-32 resize-none"
                      value={dadosTriagem.observacoes}
                      onChange={(e) =>
                        setDadosTriagem({
                          ...dadosTriagem,
                          observacoes: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Barra de Ações (Footer) */}
                  <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setPacienteSelecionado(null)}
                      className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-lg font-bold transition-colors"
                      disabled={loadingSalvar}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loadingSalvar}
                      className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loadingSalvar ? (
                        <>Processando...</>
                      ) : (
                        <>
                          <Save size={20} /> FINALIZAR TRIAGEM
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
