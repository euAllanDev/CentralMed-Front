"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalIcon,
  List,
  Plus,
  X,
} from "lucide-react";

// 1. Definimos um tipo simples para guardar a data sem horas/fusos
type DataSimples = {
  dia: number;
  mes: number;
  ano: number;
};

export default function AgendaGeral() {
  const [visualizacao, setVisualizacao] = useState("CALENDARIO");
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diasComConsultas, setDiasComConsultas] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // 2. O estado agora usa o tipo DataSimples em vez de Date
  const [modalAgendamentoAberto, setModalAgendamentoAberto] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState<DataSimples | null>(null);
  const [listaMedicos, setListaMedicos] = useState<any[]>([]);

  useEffect(() => {
    async function carregarMedicos() {
      try {
        const res = await api.get('/admin/profissionais/medicos');
        setListaMedicos(res.data);
      } catch (err) {
        console.error("Erro ao carregar médicos", err);
      }
    }
    carregarMedicos();
  }, []);

  async function carregarResumoDoMes() {
    setLoading(true);
    try {
      const ano = mesAtual.getFullYear();
      const mes = mesAtual.getMonth() + 1;

      const response = await api.get(
        `/recepcao/agendamentos/resumo-mes?ano=${ano}&mes=${mes}`
      );
      setDiasComConsultas(response.data || {});
    } catch (error) {
      console.error("Erro ao carregar resumo do mês", error);
      setDiasComConsultas({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarResumoDoMes();
  }, [mesAtual]);

  // 3. Ao clicar no dia, criamos o objeto manualmente.
  // Isso garante que o dia 21 seja dia 21, independente do horário.
  const handleDiaClick = (dia: number) => {
    if (!dia) return;
    
    const dataObjeto: DataSimples = {
      dia: dia,
      mes: mesAtual.getMonth() + 1, // Mês do JS é 0-11, passamos para 1-12
      ano: mesAtual.getFullYear()
    };

    setDataSelecionada(dataObjeto);
    setModalAgendamentoAberto(true);
  };

  const proximoMes = () =>
    setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() + 1)));
  const mesAnterior = () =>
    setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() - 1)));

  const diasDoMes = () => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDiaDaSemana = new Date(ano, mes, 1).getDay();
    const totalDiasNoMes = new Date(ano, mes + 1, 0).getDate();

    const dias = [];
    for (let i = 0; i < primeiroDiaDaSemana; i++) {
      dias.push(null);
    }
    for (let i = 1; i <= totalDiasNoMes; i++) {
      dias.push(i);
    }
    return dias;
  };

  const nomesDosDias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const nomeMes = mesAtual.toLocaleString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6 bg-gray-50 min-h-full p-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Agenda Geral</h2>
          <p className="text-gray-500 text-sm">Gerencie agendamentos futuros</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-lg border shadow-sm">
          <button
            onClick={() => setVisualizacao("CALENDARIO")}
            className={`p-2 rounded ${visualizacao === "CALENDARIO" ? "bg-blue-100 text-blue-600" : "text-gray-600"}`}
          >
            <CalIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setVisualizacao("LISTA")}
            className={`p-2 rounded ${visualizacao === "LISTA" ? "bg-blue-100 text-blue-600" : "text-gray-600"}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendário */}
      {visualizacao === "CALENDARIO" && (
        <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
          
          <div className="flex justify-between items-center mb-6">
            <button onClick={mesAnterior} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-bold text-gray-800 capitalize">{nomeMes}</h3>
            <button onClick={proximoMes} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {nomesDosDias.map((dia) => (
              <div key={dia} className="text-xs font-semibold text-gray-400 uppercase">
                {dia}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {diasDoMes().map((dia, idx) => {
              if (!dia) return <div key={idx} className="h-24"></div>;

              // Montagem simples da string para chave do objeto de contagem
              const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
              const qtd = diasComConsultas[dataStr] || 0;
              
              const hoje = new Date();
              const ehHoje = dia === hoje.getDate() && mesAtual.getMonth() === hoje.getMonth() && mesAtual.getFullYear() === hoje.getFullYear();

              return (
                <div 
                  key={idx} 
                  onClick={() => handleDiaClick(dia)}
                  className={`
                    h-24 border rounded-lg p-2 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:border-blue-300
                    ${ehHoje ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100"}
                  `}
                >
                  <span className={`text-sm font-semibold ${ehHoje ? "text-blue-600" : "text-gray-700"}`}>
                    {dia}
                  </span>
                  
                  {qtd > 0 ? (
                    <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-medium text-center">
                      {qtd} consulta{qtd > 1 ? 's' : ''}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-full opacity-0 hover:opacity-100 text-gray-400">
                        <Plus className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {visualizacao === "LISTA" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <p className="text-gray-500">Visualização em lista...</p>
        </div>
      )}

      {/* MODAL */}
      {modalAgendamentoAberto && dataSelecionada && (
        <ModalAgendamento
          dataSelecionada={dataSelecionada}
          medicos={listaMedicos}
          onClose={() => setModalAgendamentoAberto(false)}
          aoSalvar={() => {
            carregarResumoDoMes();
            setModalAgendamentoAberto(false);
          }}
        />
      )}
    </div>
  );
}

// --- COMPONENTE MODAL ---
interface ModalProps {
    dataSelecionada: DataSimples; // Recebe o objeto simples
    medicos: any[];
    onClose: () => void;
    aoSalvar: () => void;
}

function ModalAgendamento({ dataSelecionada, medicos, onClose, aoSalvar }: ModalProps) {
  const [pacienteId, setPacienteId] = useState("");
  const [medicoId, setMedicoId] = useState("");
  const [hora, setHora] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Exibição visual da data usando os números diretos (sem new Date)
  const dataVisual = `${String(dataSelecionada.dia).padStart(2,'0')}/${String(dataSelecionada.mes).padStart(2,'0')}/${dataSelecionada.ano}`;

 // Função no seu ModalAgendamento

  async function confirmarAgendamentoFuturo() {
    if (!pacienteId || !medicoId || !hora) {
      return alert("Preencha todos os campos.");
    }
    
    // --- CONSTRUÇÃO MANUAL DA DATA ---
    const ano = dataSelecionada.ano;
    const mes = String(dataSelecionada.mes).padStart(2, '0');
    const dia = String(dataSelecionada.dia).padStart(2, '0');
    
    const dataFormatada = `${ano}-${mes}-${dia}`;
    // Ex: "2026-01-21"
    // --- FIM DA CORREÇÃO ---
    
    const payload = {
      data: dataFormatada,
      hora: hora,
      paciente: { id: parseInt(pacienteId) },
      medico: { id: parseInt(medicoId) }
    };
    
    try {
      const response = await api.post("/recepcao/agendamentos", payload);

      // Leitura da resposta do backend sem usar 'new Date()' para o alerta
      const [resAno, resMes, resDia] = response.data.data.split('-');
      const dataCorretaParaExibir = `${resDia}/${resMes}/${resAno}`;

      alert(`Agendamento confirmado para ${dataCorretaParaExibir}!`);
      onClose();
    } catch(err) {
      alert("Erro ao agendar.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Novo Agendamento</h2>
            {/* Exibe a data garantida */}
            <p className="text-sm text-gray-500">
                Data: {dataVisual}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID do Paciente</label>
            <input
              type="text"
              placeholder="Digite o ID..."
              className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-500"
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Médico</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2 outline-none bg-white"
              value={medicoId}
              onChange={(e) => setMedicoId(e.target.value)}
            >
              <option value="">Selecione o Médico</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome} ({m.especialidade || 'Geral'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
            <input
              type="time"
              className="w-full border border-gray-300 rounded-lg p-2 outline-none"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition"
            disabled={salvando}
          >
            Cancelar
          </button>
          <button 
            onClick={confirmarAgendamentoFuturo}
            disabled={salvando}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition disabled:opacity-70"
          >
            {salvando ? "Salvando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}