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
} from "lucide-react";

// --- COMPONENTES AUXILIARES ---

function PacienteCard({
  agendamento,
  onChamar,
  isChamando,
  isFilaGeral = false,
}) {
  return (
    <div className="p-3 bg-gray-50 border rounded-lg animate-in fade-in-5 duration-300">
      <div className="flex justify-between items-start">
        <p className="font-bold text-gray-800 text-sm">
          {agendamento.paciente.nome}
        </p>
        <BadgePrioridade tipo={agendamento.prioridade} />
      </div>
      <p className="text-xs text-gray-500 font-mono mt-1">
        {agendamento.senhaPainel}
      </p>
      <button
        onClick={() => onChamar(agendamento)}
        disabled={isChamando}
        className={`mt-3 w-full text-xs font-bold py-1.5 rounded-md text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 ${isFilaGeral ? "bg-gray-500 hover:bg-gray-600" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        <Bell size={12} />
        {isChamando
          ? "Processando..."
          : isFilaGeral
            ? "Assumir Atendimento"
            : "Chamar e Atender"}
      </button>
    </div>
  );
}

function CardHistorico({ consulta }) {
  const data = new Date(consulta.dataHoraInicio);
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-gray-700">
          Consulta de {data.toLocaleDateString("pt-BR")}
        </h4>
        <span className="text-xs text-gray-500">
          Médico: {consulta.agendamento?.medico?.nome || "N/A"}
        </span>
      </div>
      <div className="text-sm space-y-2">
        <p>
          <strong>Queixa Principal:</strong> {consulta.anamnese || "N/A"}
        </p>
        <p>
          <strong>Diagnóstico (CID-10):</strong>{" "}
          <span className="font-mono bg-gray-200 px-1 rounded">
            {consulta.diagnosticoCid10 || "N/A"}
          </span>
        </p>
        <p>
          <strong>Prescrição:</strong> {consulta.prescricao || "N/A"}
        </p>
      </div>
    </div>
  );
}

function BadgePrioridade({ tipo }) {
  if (tipo === "ALTA_PRIORIDADE")
    return (
      <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
        MAX
      </span>
    );
  if (tipo === "PREFERENCIAL")
    return (
      <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">
        PREF
      </span>
    );
  return null;
}

// --- COMPONENTE PRINCIPAL ---

export default function MedicoPage() {
  const [minhaFila, setMinhaFila] = useState([]);
  const [filaGeral, setFilaGeral] = useState([]);
  const [pacienteEmAtendimento, setPacienteEmAtendimento] = useState(null);
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

  async function iniciarAtendimento(agendamento) {
    try {
      const [resTriagem, resHistorico, resConsulta] = await Promise.all([
        api.get(`/medico/dados-triagem/${agendamento.id}`),
        api.get(`/medico/historico/${agendamento.paciente.id}`),
        api.post(`/medico/consulta/${agendamento.id}/iniciar`),
      ]);
      setDadosTriagem(resTriagem.data);
      setHistoricoConsultas(resHistorico.data);
      setConsultaAtual(resConsulta.data);
      setPacienteEmAtendimento(agendamento);
      setAbaAtiva("ATENDIMENTO");
      setFormulario({ anamnese: "", diagnosticoCid10: "", prescricao: "" });
    } catch (error) {
      alert("Falha ao carregar dados do atendimento.");
      throw error;
    }
  }

  async function handleChamar(agendamento, isFilaGeral) {
    if (chamandoId) return;
    setChamandoId(agendamento.id);
    try {
      let agendamentoParaAtender = agendamento;
      if (isFilaGeral) {
        if (
          !confirm(
            `Deseja assumir o atendimento do paciente ${agendamento.paciente.nome}?`,
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
      const local = agendamentoParaAtender.medico?.nome
        ? `Consultório ${agendamentoParaAtender.medico.nome}`
        : "Consultório";
      await api.post(
        `/recepcao/painel/chamar/${agendamentoParaAtender.id}?local=${local}`,
      );
      await iniciarAtendimento(agendamentoParaAtender);
      if (isFilaGeral) {
        setFilaGeral((prev) => prev.filter((p) => p.id !== agendamento.id));
      } else {
        setMinhaFila((prev) => prev.filter((p) => p.id !== agendamento.id));
      }
    } catch (err) {
      alert("Erro ao iniciar atendimento.");
      carregarFilas();
    } finally {
      setChamandoId(null);
    }
  }

  async function finalizarConsulta(e) {
    e.preventDefault();
    if (!consultaAtual) return; // Segurança: só finaliza se houver consulta ativa

    try {
      // Chama a API para finalizar a consulta
      await api.post(
        `/medico/consulta/${consultaAtual.id}/finalizar`,
        formulario,
      );

      alert("Consulta finalizada com sucesso!");

      // -- LIMPEZA DO ESTADO --
      // Limpa tudo relacionado ao atendimento atual para liberar a tela
      setPacienteEmAtendimento(null);
      setDadosTriagem(null);
      setConsultaAtual(null);
      setHistoricoConsultas([]);
      setFormulario({ anamnese: "", diagnosticoCid10: "", prescricao: "" });
      setArquivo(null);

      // Recarrega as filas para garantir que o médico veja novos pacientes, se houver
      carregarFilas();
    } catch (error) {
      console.error("Erro ao finalizar a consulta:", error);
      alert(
        "Falha ao finalizar consulta. Verifique o console para mais detalhes.",
      );
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
      <div className="bg-white rounded-lg p-4 flex flex-col overflow-y-auto">
        <div className="mb-6">
          <h3 className="font-bold text-sm uppercase text-gray-600 mb-2">
            Meus Pacientes ({minhaFila.length})
          </h3>
          <div className="space-y-3">
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
        <div className="border-t pt-4">
          <h3 className="font-bold text-sm uppercase text-gray-600 mb-2">
            Fila Geral ({filaGeral.length})
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
      </div>

      <div className="md:col-span-3 bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
        {!pacienteEmAtendimento ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Stethoscope size={64} className="opacity-30 mb-4" />
            <p className="text-lg">Nenhum paciente em atendimento</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-gray-800">
                {pacienteEmAtendimento.paciente.nome}
              </h1>
              <p className="text-sm text-gray-500">
                {pacienteEmAtendimento.paciente.convenio || "Particular"}
              </p>
              <div className="mt-4 border-b -mx-6 px-6">
                <nav className="-mb-px flex space-x-6">
                  <button
                    onClick={() => setAbaAtiva("ATENDIMENTO")}
                    className={`py-3 px-1 border-b-2 font-medium flex items-center gap-2 ${abaAtiva === "ATENDIMENTO" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"}`}
                  >
                    <Stethoscope size={16} /> Atendimento
                  </button>
                  <button
                    onClick={() => setAbaAtiva("HISTORICO")}
                    className={`py-3 px-1 border-b-2 font-medium flex items-center gap-2 ${abaAtiva === "HISTORICO" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"}`}
                  >
                    <History size={16} /> Histórico ({historicoConsultas.length}
                    )
                  </button>
                </nav>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {abaAtiva === "ATENDIMENTO" && (
                <form onSubmit={finalizarConsulta} className="space-y-6">
                  {dadosTriagem && (
                    <div className="bg-blue-50 p-4 rounded-lg text-sm font-mono border border-blue-200">
                      Triagem: {dadosTriagem.peso}kg | {dadosTriagem.pressao} |{" "}
                      {dadosTriagem.temperatura}°C
                    </div>
                  )}
                  <textarea
                    className="w-full border p-2 rounded-lg h-28"
                    placeholder="Anamnese / Queixa principal..."
                    value={formulario.anamnese}
                    onChange={(e) =>
                      setFormulario({ ...formulario, anamnese: e.target.value })
                    }
                  ></textarea>
                  <input
                    className="w-full border p-2 rounded-lg"
                    placeholder="Diagnóstico (CID-10)"
                    value={formulario.diagnosticoCid10}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        diagnosticoCid10: e.target.value,
                      })
                    }
                  />
                  <textarea
                    className="w-full border p-2 rounded-lg h-28"
                    placeholder="Prescrição / Tratamento..."
                    value={formulario.prescricao}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        prescricao: e.target.value,
                      })
                    }
                  ></textarea>
                  <div className="pt-4 border-t">
                    <h4 className="flex gap-2 items-center font-bold text-gray-700 mb-2">
                      <Paperclip size={16} /> Anexos
                    </h4>
                    {(consultaAtual?.anexos || []).map((anexo) => (
                      <div key={anexo.id} className="text-xs p-1 text-gray-600">
                        {anexo.nomeOriginal}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="file"
                        onChange={(e) => setArquivo(e.target.files[0])}
                      />
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!arquivo || enviando}
                        className="bg-gray-200 px-3 py-1 text-xs font-bold rounded"
                      >
                        {enviando ? "..." : "Enviar"}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white p-2 px-6 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700"
                    >
                      <Check /> Finalizar Consulta
                    </button>
                  </div>
                </form>
              )}
              {abaAtiva === "HISTORICO" && (
                <div className="space-y-4">
                  {historicoConsultas.length > 0 ? (
                    historicoConsultas.map((c) => (
                      <CardHistorico key={c.id} consulta={c} />
                    ))
                  ) : (
                    <p>Nenhum histórico.</p>
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
