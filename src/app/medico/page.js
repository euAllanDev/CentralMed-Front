"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Stethoscope, History, Upload, Paperclip, Check, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

// Componente para Fila de Espera (Separado para organizar)
function FilaDeEspera({ fila, onSelectPaciente }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-y-auto">
      <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wider">Fila do Consultório</h3>
      <div className="space-y-2">
        {fila.map((item) => (
          <div key={item.id} onClick={() => onSelectPaciente(item)}
            className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
          >
            <p className="font-bold text-gray-800">{item.paciente.nome}</p>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500 font-mono">{item.hora.slice(0,5)}</span>
              {item.prioridade !== "NORMAL" && 
                <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">PRIORIDADE</span>
              }
            </div>
          </div>
        ))}
        {fila.length === 0 && <p className="text-gray-400 text-center text-sm p-4">Nenhum paciente aguardando.</p>}
      </div>
    </div>
  );
}

// Componente para Card de Consulta do Histórico (Expansível)
function CardHistorico({ consulta }) {
  const [expandido, setExpandido] = useState(false);
  const dataConsulta = new Date(consulta.dataHoraInicio);
  
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
        onClick={() => setExpandido(!expandido)}
      >
        <div>
          <p className="font-bold text-gray-800">{dataConsulta.toLocaleDateString('pt-BR')}</p>
          <p className="text-xs text-gray-500">Dr(a). {consulta.agendamento.medico.nome}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">{consulta.diagnosticoCid10 || 'N/A'}</span>
          {expandido ? <ChevronUp size={20} className="text-gray-500"/> : <ChevronDown size={20} className="text-gray-500"/>}
        </div>
      </div>
      {expandido && (
        <div className="p-4 border-t bg-white text-sm space-y-3">
          <p><strong>Queixa Principal:</strong> {consulta.anamnese || 'Não informado.'}</p>
          <p><strong>Prescrição:</strong> {consulta.prescricao || 'Nenhuma.'}</p>
          {/* Futuro: Listar Anexos daquela consulta passada */}
        </div>
      )}
    </div>
  );
}

// Página Principal
export default function MedicoPage() {
  const [fila, setFila] = useState([]);
  const [pacienteEmAtendimento, setPacienteEmAtendimento] = useState(null);
  const [dadosTriagem, setDadosTriagem] = useState(null);
  const [consultaAtual, setConsultaAtual] = useState(null);
  const [historicoConsultas, setHistoricoConsultas] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState("ATENDIMENTO");

  const [formulario, setFormulario] = useState({
    anamnese: "", diagnosticoCid10: "", prescricao: "",
  });
  
  useEffect(() => {
    carregarFila();
    const interval = setInterval(carregarFila, 10000);
    return () => clearInterval(interval);
  }, []);

  async function carregarFila() {
    try {
      const res = await api.get("/medico/fila");
      setFila(res.data);
    } catch(e) { console.error("Erro ao carregar fila", e); }
  }

  async function iniciarAtendimento(agendamento) {
    try {
      setPacienteEmAtendimento(agendamento); // Mostra o nome imediatamente
      const [resTriagem, resHistorico, resConsulta] = await Promise.all([
        api.get(`/medico/dados-triagem/${agendamento.id}`),
        api.get(`/medico/historico/${agendamento.paciente.id}`),
        api.post(`/medico/consulta/${agendamento.id}/iniciar`),
      ]);
      setDadosTriagem(resTriagem.data);
      setHistoricoConsultas(resHistorico.data);
      setConsultaAtual(resConsulta.data);
      setAbaAtiva("ATENDIMENTO");
    } catch(e) {
      alert("Erro ao iniciar atendimento.");
      console.error(e);
      setPacienteEmAtendimento(null); // Desfaz a ação se der erro
    }
  }

  const resetarAtendimento = () => {
      setPacienteEmAtendimento(null);
      setDadosTriagem(null);
      setConsultaAtual(null);
      setHistoricoConsultas([]);
      setFormulario({ anamnese: "", diagnosticoCid10: "", prescricao: "" });
      carregarFila();
  }

  async function finalizarConsulta(e) {
    e.preventDefault();
    try {
      await api.post(`/medico/consulta/${consultaAtual.id}/finalizar`, formulario);
      alert("Consulta finalizada com sucesso!");
      resetarAtendimento();
    } catch (error) {
      alert("Erro ao finalizar consulta.");
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
      <FilaDeEspera fila={fila} onSelectPaciente={iniciarAtendimento} />
      
      <div className="md:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {!pacienteEmAtendimento ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Stethoscope size={64} className="opacity-30" />
            <p className="mt-4 text-lg">Selecione um paciente na fila</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{pacienteEmAtendimento.paciente.nome}</h1>
                  <p className="text-sm text-gray-500">Convênio: {pacienteEmAtendimento.paciente.convenio || "Particular"}</p>
                </div>
                <button onClick={resetarAtendimento} className="text-xs text-gray-400 hover:text-red-600">Fechar</button>
              </div>
              <div className="mt-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                  <button onClick={() => setAbaAtiva("ATENDIMENTO")} className={`py-3 px-1 border-b-2 text-sm font-medium flex items-center gap-2 ${abaAtiva === 'ATENDIMENTO' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>
                    <Stethoscope size={16}/>Atendimento Atual
                  </button>
                  <button onClick={() => setAbaAtiva("HISTORICO")} className={`py-3 px-1 border-b-2 text-sm font-medium flex items-center gap-2 ${abaAtiva === 'HISTORICO' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>
                    <History size={16}/>Histórico ({historicoConsultas.length})
                  </button>
                </nav>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {abaAtiva === "ATENDIMENTO" && (
                <form onSubmit={finalizarConsulta} className="space-y-6 animate-in fade-in-5 duration-300">
                  {dadosTriagem && (
                    <div className="bg-blue-50 p-4 rounded-lg border text-sm grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div><strong>Peso:</strong> {dadosTriagem.peso} kg</div>
                      <div><strong>Pressão:</strong> {dadosTriagem.pressao}</div>
                      <div><strong>Temp.:</strong> {dadosTriagem.temperatura}°C</div>
                      <div><strong>Sat.:</strong> {dadosTriagem.saturacao}%</div>
                      <div className="col-span-full"><strong>Queixa (Triagem):</strong> {dadosTriagem.observacoes}</div>
                    </div>
                  )}
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Anamnese / Evolução Clínica</label>
                    <textarea className="w-full border p-2 rounded h-24" placeholder="Sintomas, histórico do paciente..." value={formulario.anamnese} onChange={e => setFormulario({...formulario, anamnese: e.target.value})}></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Diagnóstico (CID-10)</label>
                      <input className="w-full border p-2 rounded" placeholder="Ex: J00" value={formulario.diagnosticoCid10} onChange={e => setFormulario({...formulario, diagnosticoCid10: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Prescrição e Conduta</label>
                    <textarea className="w-full border p-2 rounded h-24" placeholder="Medicamentos, exames, orientações..." value={formulario.prescricao} onChange={e => setFormulario({...formulario, prescricao: e.target.value})}></textarea>
                  </div>
                  
                  {/* (Área de anexos pode entrar aqui) */}

                  <div className="flex justify-end pt-4 border-t">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 flex items-center gap-2">
                        <Check size={18}/> Finalizar e Salvar
                    </button>
                  </div>
                </form>
              )}
              
              {abaAtiva === "HISTORICO" && (
                <div className="space-y-4 animate-in fade-in-5 duration-300">
                  {historicoConsultas.length > 0 
                    ? historicoConsultas.map(c => <CardHistorico key={c.id} consulta={c} />) 
                    : <p className="text-center text-gray-500 p-8">Nenhum histórico encontrado para este paciente.</p>
                  }
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}