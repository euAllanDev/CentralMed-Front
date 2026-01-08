"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Activity, ClipboardList, Save } from "lucide-react";

export default function TriagemPage() {
  const [fila, setFila] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

  // Dados do formulário
  const [dadosTriagem, setDadosTriagem] = useState({
    peso: "",
    altura: "",
    pressao: "",
    temperatura: "",
    saturacao: "",
    observacoes: "",
    enfermeiroId: 1, // Hardcoded por enquanto
  });

  useEffect(() => {
    carregarFila();
    // Polling: Atualiza a cada 5 segundos
    const intervalo = setInterval(carregarFila, 5000);
    return () => clearInterval(intervalo);
  }, []);

  async function carregarFila() {
    try {
      const response = await api.get("/triagem/fila");
      setFila(response.data);
    } catch (error) {
      console.error("Erro ao carregar fila", error);
    }
  }

  function selecionarPaciente(agendamento) {
    setPacienteSelecionado(agendamento);
    // Limpa form
    setDadosTriagem({
      peso: "",
      altura: "",
      pressao: "",
      temperatura: "",
      saturacao: "",
      observacoes: "",
      enfermeiroId: 1,
    });
  }

  async function salvarTriagem(e) {
    e.preventDefault();
    if (!pacienteSelecionado) return;

    try {
      await api.post(`/triagem/${pacienteSelecionado.id}`, dadosTriagem);
      alert("Triagem realizada! Paciente enviado ao médico.");
      setPacienteSelecionado(null);
      carregarFila();
    } catch (error) {
      alert("Erro ao salvar triagem.");
      console.error(error);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
      {/* Coluna da Esquerda: Fila de Espera */}
      <div className="bg-white rounded-lg shadow-sm border p-4 overflow-y-auto">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <ClipboardList className="text-blue-500" /> Aguardando Triagem
        </h3>
        <div className="space-y-2">
          {fila.length === 0 && (
            <p className="text-gray-400 text-sm">Nenhum paciente na fila.</p>
          )}

          {fila.map((item) => (
            <div
              key={item.id}
              onClick={() => selecionarPaciente(item)}
              className={`p-3 rounded border cursor-pointer hover:bg-blue-50 transition-colors ${
                pacienteSelecionado?.id === item.id
                  ? "bg-blue-50 border-blue-400"
                  : "bg-gray-50"
              }`}
            >
              <div className="flex justify-between">
                <span className="font-bold text-gray-800">
                  {item.senhaPainel}
                </span>
                <span className="text-xs text-gray-500">{item.hora}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{item.paciente.nome}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coluna da Direita: Formulário */}
      <div className="md:col-span-2 bg-white rounded-lg shadow-sm border p-6">
        {!pacienteSelecionado ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Activity size={48} className="mb-2 opacity-50" />
            <p>Selecione um paciente na fila para iniciar a triagem.</p>
          </div>
        ) : (
          <form onSubmit={salvarTriagem} className="space-y-4">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-bold text-blue-700">
                {pacienteSelecionado.paciente.nome}
              </h2>
              <p className="text-gray-500 text-sm">
                CPF: {pacienteSelecionado.paciente.cpf} | Convênio:{" "}
                {pacienteSelecionado.paciente.convenio}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full border p-2 rounded"
                  value={dadosTriagem.peso}
                  onChange={(e) =>
                    setDadosTriagem({ ...dadosTriagem, peso: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Altura (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border p-2 rounded"
                  value={dadosTriagem.altura}
                  onChange={(e) =>
                    setDadosTriagem({ ...dadosTriagem, altura: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Pressão Arterial
                </label>
                <input
                  type="text"
                  placeholder="12/8"
                  className="w-full border p-2 rounded"
                  value={dadosTriagem.pressao}
                  onChange={(e) =>
                    setDadosTriagem({
                      ...dadosTriagem,
                      pressao: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Temperatura (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full border p-2 rounded"
                  value={dadosTriagem.temperatura}
                  onChange={(e) =>
                    setDadosTriagem({
                      ...dadosTriagem,
                      temperatura: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Saturação (%)
                </label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
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

            <div>
              <label className="text-sm font-semibold text-gray-600">
                Observações / Queixa Principal
              </label>
              <textarea
                className="w-full border p-2 rounded h-24"
                value={dadosTriagem.observacoes}
                onChange={(e) =>
                  setDadosTriagem({
                    ...dadosTriagem,
                    observacoes: e.target.value,
                  })
                }
              ></textarea>
            </div>

            <div className="pt-4 flex justify-end">
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
