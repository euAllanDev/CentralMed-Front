"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Activity, ClipboardList, Save, RotateCcw } from "lucide-react";

// --- COMPONENTES VISUAIS (Helpers) ---

function BadgePrioridade({ tipo }) {
  if (tipo === "ALTA_PRIORIDADE") {
    return <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">PRIORIDADE MÁX</span>;
  }
  if (tipo === "PREFERENCIAL") {
    return <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">PREFERENCIAL</span>;
  }
  return null;
}

function BadgeRetorno({ isRetorno }) {
  if (!isRetorno) return null;
  return (
    <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase flex items-center gap-1">
      <RotateCcw size={10}/> RETORNO
    </span>
  );
}
// ------------------------------------

export default function TriagemPage() {
  const [fila, setFila] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

  const [dadosTriagem, setDadosTriagem] = useState({
    peso: "", altura: "", pressao: "", temperatura: "", 
    saturacao: "", observacoes: "", enfermeiroId: 1
  });

  useEffect(() => {
    carregarFila();
    const intervalo = setInterval(carregarFila, 5000);
    return () => clearInterval(intervalo);
  }, []);

  async function carregarFila() {
    try {
      const response = await api.get("/triagem/fila");
      setFila(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar fila", error);
    }
  }

  function selecionarPaciente(agendamento) {
    setPacienteSelecionado(agendamento);
    setDadosTriagem({
      peso: "", altura: "", pressao: "", temperatura: "", 
      saturacao: "", observacoes: "", enfermeiroId: 1,
    });
  }

  async function salvarTriagem(e) {
    e.preventDefault();
    if (!pacienteSelecionado) return;

    try {
      await api.post(`/triagem/${pacienteSelecionado.id}`, dadosTriagem);
      alert("Triagem realizada! Paciente enviado para a fila do médico.");
      setPacienteSelecionado(null);
      carregarFila();
    } catch (error) {
      alert("Erro ao salvar triagem.");
      console.error(error);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
      {/* Coluna Fila */}
      <div className="bg-white rounded-lg shadow-sm border p-4 overflow-y-auto">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <ClipboardList className="text-blue-500" /> Aguardando Triagem ({fila.length})
        </h3>
        <div className="space-y-2">
          {fila.length === 0 ? (
            <p className="text-gray-400 text-sm p-4 text-center">Nenhum paciente na fila.</p>
          ) : (
            fila.map((item) => (
              <div
                key={item.id}
                onClick={() => selecionarPaciente(item)}
                className={`p-3 rounded-lg border cursor-pointer hover:bg-blue-50 transition-colors ${pacienteSelecionado?.id === item.id ? "bg-blue-100 border-blue-400" : "bg-gray-50"
                  }`}
              >
                {/* --- HEADER DO CARD (Senha, Hora e Prioridade) --- */}
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-lg text-gray-800">{item.senhaPainel}</span>
                  <div className="flex items-center gap-2">
                    <BadgePrioridade tipo={item.prioridade} />
                    <span className="text-xs text-gray-500 font-mono">{item.hora?.slice(0,5)}</span>
                  </div>
                </div>

                {/* --- INFORMAÇÕES DO PACIENTE --- */}
                <p className="text-sm text-gray-700 font-semibold">{item.paciente.nome}</p>
                <div className="mt-2">
                  <BadgeRetorno isRetorno={item.isRetorno} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Coluna Formulário */}
      <div className="md:col-span-2 bg-white rounded-lg shadow-sm border p-6 flex flex-col">
        {!pacienteSelecionado ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
            <Activity size={48} className="mb-2 opacity-30" />
            <p className="font-bold">Nenhum Paciente Selecionado</p>
            <p className="text-sm">Clique em um paciente na fila à esquerda para iniciar a triagem.</p>
          </div>
        ) : (
          <form onSubmit={salvarTriagem} className="space-y-4 flex-1 flex flex-col">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-bold text-blue-700">{pacienteSelecionado.paciente.nome}</h2>
              <p className="text-gray-500 text-sm">
                CPF: {pacienteSelecionado.paciente.cpf} | Convênio: {pacienteSelecionado.paciente.convenio}
              </p>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Inputs de Peso, Altura, Pressão... */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Peso (kg)</label>
                  <input type="number" step="0.1" className="w-full border p-2 rounded mt-1" value={dadosTriagem.peso} onChange={(e) => setDadosTriagem({ ...dadosTriagem, peso: e.target.value })}/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Altura (m)</label>
                  <input type="number" step="0.01" className="w-full border p-2 rounded mt-1" value={dadosTriagem.altura} onChange={(e) => setDadosTriagem({ ...dadosTriagem, altura: e.target.value })}/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Pressão Art.</label>
                  <input type="text" placeholder="12/8" className="w-full border p-2 rounded mt-1" value={dadosTriagem.pressao} onChange={(e) => setDadosTriagem({ ...dadosTriagem, pressao: e.target.value })}/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Temp. (°C)</label>
                  <input type="number" step="0.1" className="w-full border p-2 rounded mt-1" value={dadosTriagem.temperatura} onChange={(e) => setDadosTriagem({ ...dadosTriagem, temperatura: e.target.value })}/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Saturação (%)</label>
                  <input type="number" className="w-full border p-2 rounded mt-1" value={dadosTriagem.saturacao} onChange={(e) => setDadosTriagem({ ...dadosTriagem, saturacao: e.target.value })}/>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Observações / Queixa</label>
                <textarea className="w-full border p-2 rounded mt-1 h-24" value={dadosTriagem.observacoes} onChange={(e) => setDadosTriagem({ ...dadosTriagem, observacoes: e.target.value })}></textarea>
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-bold"
              >
                <Save size={20} /> Finalizar Triagem
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}