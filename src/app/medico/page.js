"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Stethoscope, History, Upload, Paperclip, Check, FileText, UserCircle, AlertCircle, Sparkles } from "lucide-react";

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

  useEffect(() => {
    carregarFila();
    const interval = setInterval(carregarFila, 10000); // 10s
    return () => clearInterval(interval);
  }, []);

  async function carregarFila() {
    try {
      const response = await api.get("/medico/fila");
      setFila(response.data || []);
    } catch (error) {
      console.error(error);
      setFila([]); // Garante que a fila seja uma lista em caso de erro
    }
  }

  async function iniciarAtendimento(agendamento) {
    try {
      setAbaAtiva("ATENDIMENTO");
      const [resTriagem, resHistorico, resConsulta] = await Promise.all([
        api.get(`/medico/dados-triagem/${agendamento.id}`),
        api.get(`/medico/historico/${agendamento.paciente.id}`),
        api.post(`/medico/consulta/${agendamento.id}/iniciar`),
      ]);
      
      setDadosTriagem(resTriagem.data);
      setHistoricoConsultas(Array.isArray(resHistorico.data) ? resHistorico.data : []);
      setConsultaAtual(resConsulta.data);
      setPacienteEmAtendimento(agendamento);
      
      setFila((currentFila) =>
        currentFila.filter((f) => f.id !== agendamento.id)
      );
    } catch (error) {
      alert("Erro ao iniciar atendimento. Seu token pode ter expirado. Por favor, faça login novamente.");
      console.error(error);
    }
  }

  // Lógica de upload mantida, mas precisará de um backend para funcionar
  async function handleUpload() {
    if (!arquivo || !consultaAtual?.id) return;
    setEnviando(true);
    const formData = new FormData();
    formData.append("file", arquivo);

    try {
      // Endpoint de exemplo:
      // const response = await api.post(`/anexos/upload/${consultaAtual.id}`, formData);
      alert("Arquivo enviado com sucesso!");
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
      
      // Limpa todos os estados relacionados ao atendimento
      setPacienteEmAtendimento(null);
      setDadosTriagem(null);
      setConsultaAtual(null);
      setHistoricoConsultas([]);
      setFormulario({ anamnese: "", diagnosticoCid10: "", prescricao: "" });

      carregarFila(); // Atualiza a fila
    } catch (error) {
      alert("Erro ao finalizar consulta.");
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-y-auto flex flex-col">
        <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wider">
          Fila do Consultório
        </h3>
        {fila.length > 0 ? (
          <div className="space-y-2">
            {fila.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-gray-50 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => iniciarAtendimento(item)}
              >
                <div className="flex justify-between items-start">
                  <p className="font-bold text-gray-800">{item.paciente.nome}</p>
                  {item.isRetorno && (
                    <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      RETORNO
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 font-mono mt-1 block">
                  Chegada: {item.hora.slice(0,5)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <UserCircle size={32} className="opacity-50"/>
            <p className="text-xs text-center mt-2">Nenhum paciente aguardando.</p>
          </div>
        )}
      </div>

      <div className="md:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {!pacienteEmAtendimento ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Stethoscope size={64} className="mb-4 opacity-30" />
            <p className="text-lg">Selecione um paciente na fila para iniciar.</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h1 className="text-2xl font-bold text-gray-800">{pacienteEmAtendimento.paciente.nome}</h1>
              <p className="text-sm text-gray-500">{pacienteEmAtendimento.paciente.convenio?.nome || "Particular"}</p>
              <div className="mt-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                  <TabButton label="Atendimento" icon={Stethoscope} isActive={abaAtiva === "ATENDIMENTO"} onClick={() => setAbaAtiva("ATENDIMENTO")} />
                  <TabButton label="Histórico" icon={History} isActive={abaAtiva === "HISTORICO"} onClick={() => setAbaAtiva("HISTORICO")} />
                </nav>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {abaAtiva === "ATENDIMENTO" && (
                <form onSubmit={finalizarConsulta} className="space-y-6 animate-in fade-in-5 duration-300">
                  {dadosTriagem && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm">
                        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><AlertCircle size={16}/>Dados da Triagem</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-700">
                            <p><strong>Peso:</strong> {dadosTriagem.peso} kg</p>
                            <p><strong>P.A.:</strong> {dadosTriagem.pressao}</p>
                            <p><strong>Temp:</strong> {dadosTriagem.temperatura}°C</p>
                            <p><strong>Sat.:</strong> {dadosTriagem.saturacao}%</p>
                            <p className="col-span-full"><strong>Obs:</strong> {dadosTriagem.observacoes}</p>
                        </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Anamnese</label>
                    <textarea className="w-full border p-2 rounded" placeholder="Queixa principal e histórico..."
                      value={formulario.anamnese} onChange={(e) => setFormulario({ ...formulario, anamnese: e.target.value })}/>
                  </div>
                   <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Diagnóstico (CID-10)</label>
                    <input className="w-full border p-2 rounded" placeholder="Ex: J00"
                      value={formulario.diagnosticoCid10} onChange={(e) => setFormulario({ ...formulario, diagnosticoCid10: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Prescrição</label>
                    <textarea className="w-full border p-2 rounded" placeholder="Medicamentos, exames, conduta..."
                      value={formulario.prescricao} onChange={(e) => setFormulario({ ...formulario, prescricao: e.target.value })} />
                  </div>
                  <div className="pt-4 border-t">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2"><Paperclip size={16}/> Anexos</label>
                    <input type="file" className="text-sm" onChange={(e) => setArquivo(e.target.files[0])}/>
                  </div>
                  <div className="flex justify-end pt-4 border-t">
                    <button type="submit" className="bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 flex items-center gap-2">
                        <Check /> Finalizar Atendimento
                    </button>
                  </div>
                </form>
              )}
              {abaAtiva === "HISTORICO" && (
                <div className="space-y-4 animate-in fade-in-5 duration-300">
                  {historicoConsultas.length > 0 ? historicoConsultas.map((c) => (
                    <CardHistorico key={c.id} consulta={c} />
                  )) : (
                    <p className="text-gray-400 text-center p-8">Nenhum histórico encontrado para este paciente.</p>
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

// Componentes Auxiliares
function TabButton({ label, icon: Icon, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`py-3 px-1 border-b-2 flex items-center gap-2 font-medium text-sm transition-all ${
                isActive ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-blue-700"
            }`}
        >
            <Icon size={16} /> {label}
        </button>
    );
}

function CardHistorico({ consulta }) {
    if (!consulta) return null;

    const dataFormatada = consulta.dataHoraInicio 
        ? new Date(consulta.dataHoraInicio).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }) 
        : 'Data Indisponível';

    const nomeMedico = consulta.agendamento?.medico?.nome || 'Médico não informado';

    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-800 text-base">
                {dataFormatada}
                </h4>
                <span className="text-xs text-gray-500 font-medium">
                Dr(a) {nomeMedico}
                </span>
            </div>
            <p className="text-sm"><strong className="text-gray-600 font-semibold">Anamnese:</strong> {consulta.anamnese || "N/A"}</p>
            <p className="text-sm"><strong className="text-gray-600 font-semibold">CID-10:</strong> {consulta.diagnosticoCid10 || "N/A"}</p>
        </div>
    );
}