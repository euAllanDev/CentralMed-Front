"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import {
  Stethoscope,
  History,
  Upload,
  Paperclip,
  Check,
  Bell,
  AlertCircle,
  FileText,
  UserCircle,
} from "lucide-react";

// --- COMPONENTES AUXILIARES ---

function PacienteCard({
  agendamento,
  onChamar,
  isChamando,
  isFilaGeral = false,
}) {
  return (
    <div className="p-3 bg-gray-50 border rounded-lg animate-in fade-in-5 duration-300 hover:bg-blue-50 transition-colors">
      <div className="flex justify-between items-start">
        <p className="font-bold text-gray-800 text-sm">
          {agendamento.paciente.nome}
        </p>
        <BadgePrioridade tipo={agendamento.prioridade} />
      </div>
      <p className="text-xs text-gray-500 font-mono mt-1">
        Senha: {agendamento.senhaPainel}
      </p>
      <button
        onClick={() => onChamar(agendamento)}
        disabled={isChamando}
        className={`mt-3 w-full text-xs font-bold py-2 rounded-md text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${isFilaGeral ? "bg-slate-600 hover:bg-slate-700" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        <Bell size={14} />
        {isChamando
          ? "Chamando..."
          : isFilaGeral
            ? "Puxar Atendimento"
            : "Chamar Painel"}
      </button>
    </div>
  );
}

// --- CARD HISTÓRICO MELHORADO ---
function CardHistorico({ consulta }) {
  // Tratamento de segurança para Data
  const dataFormatada = consulta.dataHoraInicio
    ? new Date(consulta.dataHoraInicio).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Data N/A";

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-3 border-b pb-2 border-gray-100">
        <h4 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
          <FileText size={16} className="text-blue-500" />
          {dataFormatada}
        </h4>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
          Dr(a) {consulta.agendamento?.medico?.nome || "Não informado"}
        </span>
      </div>
      <div className="text-sm space-y-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400">
            Queixa / Anamnese
          </span>
          <p className="text-gray-800 bg-gray-50 p-2 rounded mt-1">
            {consulta.anamnese || "---"}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400">
            Diagnóstico (CID)
          </span>
          <p className="text-gray-800 font-mono text-xs mt-1 bg-blue-50 inline-block px-2 py-1 rounded">
            {consulta.diagnosticoCid10 || "---"}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400">
            Prescrição
          </span>
          <p className="text-gray-800 bg-yellow-50 p-2 rounded mt-1 border border-yellow-100">
            {consulta.prescricao || "---"}
          </p>
        </div>
      </div>
    </div>
  );
}

function BadgePrioridade({ tipo }) {
  if (tipo === "ALTA_PRIORIDADE" || tipo === "PRIORIDADE")
    return (
      <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-200">
        PRIORIDADE
      </span>
    );
  if (tipo === "PREFERENCIAL")
    return (
      <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full border border-yellow-200">
        PREFERENCIAL
      </span>
    );
  return null;
}

// --- COMPONENTE PRINCIPAL ---

export default function MedicoPage() {
  const [minhaFila, setMinhaFila] = useState([]);
  const [filaGeral, setFilaGeral] = useState([]);

  const [pacienteEmAtendimento, setPacienteEmAtendimento] = useState(null);

  // Estados do Atendimento
  const [dadosTriagem, setDadosTriagem] = useState(null);
  const [consultaAtual, setConsultaAtual] = useState(null);
  const [historicoConsultas, setHistoricoConsultas] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState("ATENDIMENTO");

  const [formulario, setFormulario] = useState({
    anamnese: "",
    diagnosticoCid10: "",
    prescricao: "",
  });

  const [arquivo, setArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [chamandoId, setChamandoId] = useState(null);

  useEffect(() => {
    carregarFilas();
    const interval = setInterval(carregarFilas, 10000);
    return () => clearInterval(interval);
  }, []);

  async function carregarFilas() {
    try {
      const response = await api.get("/medico/fila-completa");
      if (response.data) {
        setMinhaFila(response.data.minhaFila || []);
        setFilaGeral(response.data.filaGeral || []);
      }
    } catch (error) {
      console.error("Erro ao carregar filas do médico:", error);
    }
  }

  // --- LÓGICA DE HISTÓRICO APLICADA AQUI ---
  async function iniciarAtendimento(agendamento) {
    try {
      // 1. Busca dados em paralelo para ser rápido
      const [resTriagem, resHistorico, resConsulta] = await Promise.all([
        api.get(`/medico/dados-triagem/${agendamento.id}`),
        api.get(`/medico/historico/${agendamento.paciente.id}`), // <--- Histórico do paciente
        api.post(`/medico/consulta/${agendamento.id}/iniciar`),
      ]);

      setDadosTriagem(resTriagem.data);

      // 2. SEGURANÇA: Garante que histórico é um array (evita crash se vier null)
      setHistoricoConsultas(
        Array.isArray(resHistorico.data) ? resHistorico.data : [],
      );

      setConsultaAtual(resConsulta.data);
      setPacienteEmAtendimento(agendamento);
      setAbaAtiva("ATENDIMENTO");

      // Limpa formulário
      setFormulario({ anamnese: "", diagnosticoCid10: "", prescricao: "" });
    } catch (error) {
      alert("Falha ao carregar dados do atendimento. Tente novamente.");
      console.error(error);
    }
  }

  async function handleChamar(agendamento, isFilaGeral) {
    if (chamandoId) return;
    setChamandoId(agendamento.id);

    try {
      let agendamentoParaAtender = agendamento;

      // Lógica de "Roubar" da fila geral
      if (isFilaGeral) {
        if (
          !confirm(
            `Deseja assumir o atendimento de ${agendamento.paciente.nome}?`,
          )
        ) {
          setChamandoId(null);
          return;
        }
        const res = await api.post(
          `/medico/atender-fila-geral/${agendamento.id}`,
        );
        agendamentoParaAtender = res.data;
      }

      // Monta o nome do local (Ex: Consultório Dr. Fulano)
      const nomeMedico = agendamentoParaAtender.medico?.nome || "Médico";
      const local = `Consultório ${nomeMedico}`;

      // Chama no Painel
      await api.post(
        `/recepcao/painel/chamar/${agendamentoParaAtender.id}?local=${local}`,
      );

      // Inicia o fluxo de tela
      await iniciarAtendimento(agendamentoParaAtender);

      // Atualiza filas visualmente na hora (sem esperar o polling de 10s)
      if (isFilaGeral) {
        setFilaGeral((prev) => prev.filter((p) => p.id !== agendamento.id));
      } else {
        setMinhaFila((prev) => prev.filter((p) => p.id !== agendamento.id));
      }
    } catch (err) {
      alert("Erro ao iniciar atendimento.");
      carregarFilas(); // Recarrega para garantir consistência
    } finally {
      setChamandoId(null);
    }
  }

  async function finalizarConsulta(e) {
    e.preventDefault();
    if (!consultaAtual) return;

    try {
      await api.post(
        `/medico/consulta/${consultaAtual.id}/finalizar`,
        formulario,
      );

      alert("Consulta finalizada com sucesso!");

      setPacienteEmAtendimento(null);
      setDadosTriagem(null);
      setConsultaAtual(null);
      setHistoricoConsultas([]);
      setFormulario({ anamnese: "", diagnosticoCid10: "", prescricao: "" });
      setArquivo(null);

      carregarFilas();
    } catch (error) {
      console.error("Erro ao finalizar:", error);
      alert("Erro ao finalizar consulta.");
    }
  }

  async function handleUpload() {
    if (!arquivo || !consultaAtual?.id) return;
    setEnviando(true);
    const formData = new FormData();
    formData.append("file", arquivo);
    try {
      const response = await api.post(
        `/anexos/upload/${consultaAtual.id}`,
        formData,
      );
      alert("Arquivo anexado!");
      setConsultaAtual((prev) => ({
        ...prev,
        anexos: [...(prev.anexos || []), response.data],
      }));
      setArquivo(null);
    } catch (err) {
      alert("Erro ao enviar arquivo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
      {/* --- COLUNA DA ESQUERDA (FILAS) --- */}
      <div className="bg-white rounded-lg p-4 flex flex-col overflow-y-auto border border-gray-200 shadow-sm">
        <div className="mb-6">
          <h3 className="font-bold text-xs uppercase text-gray-500 mb-3 tracking-wider flex items-center gap-2">
            <UserCircle size={16} /> Meus Pacientes ({minhaFila.length})
          </h3>
          <div className="space-y-3">
            {minhaFila.length === 0 && (
              <p className="text-sm text-gray-400 italic text-center py-4">
                Sua fila está vazia.
              </p>
            )}
            {minhaFila.map((item) => (
              <PacienteCard
                key={item.id}
                agendamento={item}
                onChamar={() => handleChamar(item, false)}
                isChamando={chamandoId === item.id}
              />
            ))}
          </div>
        </div>

        {/* Fila Geral (Só aparece se tiver gente) */}
        {filaGeral.length > 0 && (
          <div className="border-t pt-4 border-dashed">
            <h3 className="font-bold text-xs uppercase text-gray-500 mb-3 tracking-wider flex items-center gap-2">
              <AlertCircle size={16} /> Fila Geral / Outros ({filaGeral.length})
            </h3>
            <div className="space-y-3">
              {filaGeral.map((item) => (
                <PacienteCard
                  key={item.id}
                  agendamento={item}
                  onChamar={() => handleChamar(item, true)}
                  isChamando={chamandoId === item.id}
                  isFilaGeral={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- ÁREA PRINCIPAL (ATENDIMENTO) --- */}
      <div className="md:col-span-3 bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
        {!pacienteEmAtendimento ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Stethoscope size={64} className="opacity-20 mb-4" />
            <p className="text-lg font-medium">Nenhum paciente selecionado</p>
            <p className="text-sm opacity-60">
              Chame alguém da fila para começar.
            </p>
          </div>
        ) : (
          <>
            {/* CABEÇALHO DO PACIENTE */}
            <div className="p-6 border-b bg-gray-50 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  {pacienteEmAtendimento.paciente.nome}
                </h1>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  Convênio:{" "}
                  {pacienteEmAtendimento.paciente.convenio || "Particular"}
                </p>
              </div>

              {/* NAVEGAÇÃO ENTRE ABAS */}
              <div className="flex bg-white rounded-lg p-1 border shadow-sm">
                <button
                  onClick={() => setAbaAtiva("ATENDIMENTO")}
                  className={`py-2 px-4 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${abaAtiva === "ATENDIMENTO" ? "bg-blue-100 text-blue-700 shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  <Stethoscope size={16} /> Atendimento
                </button>
                <button
                  onClick={() => setAbaAtiva("HISTORICO")}
                  className={`py-2 px-4 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${abaAtiva === "HISTORICO" ? "bg-blue-100 text-blue-700 shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  <History size={16} /> Histórico ({historicoConsultas.length})
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {/* === ABA ATENDIMENTO === */}
              {abaAtiva === "ATENDIMENTO" && (
                <form
                  onSubmit={finalizarConsulta}
                  className="space-y-6 animate-in fade-in-5 duration-300"
                >
                  {dadosTriagem && (
                    <div className="bg-blue-50 p-4 rounded-lg text-sm border border-blue-100 flex gap-6 text-gray-700 shadow-sm">
                      <div>
                        <span className="text-xs text-gray-500 block">
                          Peso
                        </span>
                        <strong>{dadosTriagem.peso} kg</strong>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">
                          P.A.
                        </span>
                        <strong>{dadosTriagem.pressao}</strong>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block">
                          Temp
                        </span>
                        <strong>{dadosTriagem.temperatura}°C</strong>
                      </div>
                      <div className="border-l pl-4 border-blue-200 flex-1">
                        <span className="text-xs text-gray-500 block">
                          Obs Enfermagem
                        </span>
                        {dadosTriagem.observacoes || "Nenhuma"}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">
                        Anamnese / Queixa
                      </label>
                      <textarea
                        className="w-full border border-gray-300 p-3 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        placeholder="Descreva o histórico..."
                        value={formulario.anamnese}
                        onChange={(e) =>
                          setFormulario({
                            ...formulario,
                            anamnese: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">
                        Diagnóstico (CID-10)
                      </label>
                      <input
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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

                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-1 block">
                        Prescrição / Conduta
                      </label>
                      <textarea
                        className="w-full border border-gray-300 p-3 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        placeholder="Medicamentos e exames..."
                        value={formulario.prescricao}
                        onChange={(e) =>
                          setFormulario({
                            ...formulario,
                            prescricao: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="flex gap-2 items-center font-bold text-gray-700 mb-2 text-sm">
                      <Paperclip size={16} /> Anexos do Atendimento
                    </h4>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {(consultaAtual?.anexos || []).map((anexo) => (
                        <div
                          key={anexo.id}
                          className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 border"
                        >
                          {anexo.nomeOriginal}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="file"
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        onChange={(e) => setArquivo(e.target.files[0])}
                      />
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!arquivo || enviando}
                        className="bg-gray-800 text-white px-3 py-1.5 text-xs font-bold rounded disabled:opacity-50 hover:bg-gray-900"
                      >
                        {enviando ? "Enviando..." : "Upload"}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 shadow-md transform active:scale-95 transition-all"
                    >
                      <Check size={18} /> Finalizar Consulta
                    </button>
                  </div>
                </form>
              )}

              {/* === ABA HISTÓRICO === */}
              {abaAtiva === "HISTORICO" && (
                <div className="space-y-4 animate-in slide-in-from-right-5 duration-300">
                  {historicoConsultas.length > 0 ? (
                    historicoConsultas.map((c) => (
                      <CardHistorico key={c.id} consulta={c} />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50 rounded border border-dashed border-gray-300">
                      <History size={48} className="mb-2 opacity-20" />
                      <p>Este paciente não possui histórico anterior.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
