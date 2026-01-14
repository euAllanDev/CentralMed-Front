"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Stethoscope, History, Upload, Paperclip, Check } from "lucide-react"; // Adicionado Icon

export default function MedicoPage() {
  const [fila, setFila] = useState([]);
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

  // --- Efeito corrigido ---
  useEffect(() => {
    carregarFila();
    const interval = setInterval(carregarFila, 10000);
    return () => clearInterval(interval);
  }, []); // '[]' garante que rode só uma vez

  async function carregarFila() {
    try {
      const response = await api.get("/medico/fila");
      setFila(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  // --- Função Renomeada e Corrigida ---
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

      // Filtra a fila baseada na versão mais ATUAL do estado 'fila'
      // para evitar race condition
      setFila((currentFila) =>
        currentFila.filter((f) => f.id !== agendamento.id)
      );
      setAbaAtiva("ATENDIMENTO");
    } catch (error) {
      alert("Erro ao iniciar atendimento.");
      console.error(error);
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
        formData
      );
      alert("Arquivo enviado com sucesso!");

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

  async function finalizarConsulta(e) {
    e.preventDefault();
    try {
      await api.post(
        `/medico/consulta/${consultaAtual.id}/finalizar`,
        formulario
      );
      alert("Consulta finalizada com sucesso!");
      setPacienteEmAtendimento(null);
      carregarFila();
    } catch (error) {
      alert("Erro ao finalizar consulta.");
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
      {/* Coluna da Fila (Lógica de chamar paciente ajustada) */}
      <div className="bg-white rounded-lg shadow-sm border p-4 overflow-y-auto">
        <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase">
          Fila do Consultório
        </h3>
        <div className="space-y-2">
          {fila.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-gray-50 border rounded hover:bg-blue-50 cursor-pointer"
              onClick={() => iniciarAtendimento(item)}
            >
              <p className="font-bold text-gray-800">{item.paciente.nome}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Área de Atendimento (Completa) */}
      <div className="md:col-span-3 bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
        {!pacienteEmAtendimento ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Stethoscope size={64} /> Selecione um paciente...
          </div>
        ) : (
          <>
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold">
                {pacienteEmAtendimento.paciente.nome}
              </h1>
              <p className="text-sm text-gray-500">
                {pacienteEmAtendimento.paciente.convenio?.nome}
              </p>
              <div className="mt-4 border-b">
                <nav className="-mb-px flex space-x-6">
                  <button
                    onClick={() => setAbaAtiva("ATENDIMENTO")}
                    className={`py-3 px-1 border-b-2 font-medium ${
                      abaAtiva === "ATENDIMENTO"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500"
                    }`}
                  >
                    <Stethoscope /> Atendimento
                  </button>
                  <button
                    onClick={() => setAbaAtiva("HISTORICO")}
                    className={`py-3 px-1 border-b-2 font-medium ${
                      abaAtiva === "HISTORICO"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500"
                    }`}
                  >
                    <History /> Histórico
                  </button>
                </nav>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {abaAtiva === "ATENDIMENTO" && (
                <form onSubmit={finalizarConsulta} className="space-y-6">
                  {dadosTriagem && (
                    <div className="bg-blue-50 p-4 rounded text-sm">
                      Dados Triagem: {dadosTriagem.peso}kg |{" "}
                      {dadosTriagem.pressao}
                    </div>
                  )}
                  <textarea
                    className="w-full border p-2"
                    placeholder="Anamnese..."
                    value={formulario.anamnese}
                    onChange={(e) =>
                      setFormulario({ ...formulario, anamnese: e.target.value })
                    }
                  ></textarea>
                  <input
                    className="w-full border p-2"
                    placeholder="CID-10"
                    value={formulario.diagnosticoCid10}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        diagnosticoCid10: e.target.value,
                      })
                    }
                  />
                  <textarea
                    className="w-full border p-2"
                    placeholder="Prescrição..."
                    value={formulario.prescricao}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        prescricao: e.target.value,
                      })
                    }
                  ></textarea>

                  <div className="pt-4 border-t">
                    <h4>Anexos</h4>
                    {(consultaAtual?.anexos || []).map((a) => (
                      <div key={a.id}>{a.nomeOriginal}</div>
                    ))}
                    <input
                      type="file"
                      onChange={(e) => setArquivo(e.target.files[0])}
                    />
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={!arquivo || enviando}
                    >
                      {enviando ? "Enviando..." : "Enviar"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded"
                  >
                    <Check /> Finalizar
                  </button>
                </form>
              )}
              {abaAtiva === "HISTORICO" && (
                <div className="space-y-4">
                  {historicoConsultas.map((c) => (
                    <CardHistorico key={c.id} consulta={c} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CardHistorico({ consulta }) {
  const data = new Date(consulta.dataHoraInicio);
  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h4 className="font-bold">
        {data.toLocaleDateString()} - Dr(a) {consulta.agendamento.medico.nome}
      </h4>
      <p>
        <strong>Queixa:</strong> {consulta.anamnese}
      </p>
      <p>
        <strong>CID-10:</strong> {consulta.diagnosticoCid10}
      </p>
      <p>
        <strong>Prescrição:</strong> {consulta.prescricao}
      </p>
    </div>
  );
}
