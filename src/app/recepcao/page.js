"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { 
  UserPlus, Calendar, Clock, Search, X, CheckCircle, 
  Stethoscope, AlertCircle, Save 
} from "lucide-react";

export default function RecepcaoDashboard() {
  const [modalAberto, setModalAberto] = useState(false);
  
  // Dados para Listas
  const [todosPacientes, setTodosPacientes] = useState([]);
  const [listaMedicos, setListaMedicos] = useState([]); // Nova lista de médicos
  
  // Busca
  const [termoBusca, setTermoBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  
  // Novo Cadastro (Completo)
  const [modoCadastro, setModoCadastro] = useState(false);
  const [novoPaciente, setNovoPaciente] = useState({ 
    nome: "", 
    cpf: "", 
    dataNasc: "", 
    convenio: "Particular",
    alergiasComorbidades: "" // Adicionado campo extra
  });

  // Configuração do Atendimento
  const [prioridade, setPrioridade] = useState("NORMAL");
  const [medicoSelecionado, setMedicoSelecionado] = useState(""); // ID do médico ou vazio

  // 1. Carrega dados iniciais (Pacientes e Médicos)
  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  async function carregarDadosIniciais() {
    try {
      // Carrega pacientes
      const resPacientes = await api.get("/recepcao/pacientes");
      setTodosPacientes(resPacientes.data);

      // Carrega médicos (Se der erro 403, avise para liberar no SecurityConfig)
      const resMedicos = await api.get("/admin/profissionais/medicos");
      setListaMedicos(resMedicos.data);
    } catch (error) {
      console.error("Erro ao carregar dados.", error);
    }
  }

  // 2. Filtra busca
  useEffect(() => {
    if (termoBusca.length < 2) {
      setResultados([]);
      return;
    }
    const filtrados = todosPacientes.filter(p => 
      p.nome.toLowerCase().includes(termoBusca.toLowerCase()) || 
      p.cpf.includes(termoBusca)
    );
    setResultados(filtrados);
  }, [termoBusca, todosPacientes]);

  // 3. Cadastrar Paciente (Completo agora)
  async function cadastrarPaciente() {
    if(!novoPaciente.nome || !novoPaciente.cpf) {
        alert("Preencha os campos obrigatórios.");
        return;
    }
    try {
      const res = await api.post("/recepcao/pacientes", novoPaciente);
      alert("Paciente cadastrado com sucesso!");
      
      // Atualiza lista local e seleciona o novo paciente
      setTodosPacientes([...todosPacientes, res.data]);
      setPacienteSelecionado(res.data);
      setModoCadastro(false);
    } catch (error) {
      alert("Erro ao cadastrar. Verifique se o CPF já existe.");
    }
  }

  // 4. Confirmar Atendimento (Com Prioridade e Médico)
  async function confirmarAtendimento() {
    if (!pacienteSelecionado) return;
    
    try {
      const payload = {
        pacienteId: pacienteSelecionado.id,
        medicoId: medicoSelecionado || null, // Se vazio, manda null (Triagem Geral)
        prioridade: prioridade
      };

      const response = await api.post("/recepcao/atendimento-imediato", payload);
      
      // Formatar mensagem de sucesso
      const nomeMedico = listaMedicos.find(m => m.id == medicoSelecionado)?.nome || "Qualquer Médico (Fila Geral)";
      
      alert(`✅ Senha Gerada: ${response.data.senhaPainel}\n\nPaciente: ${pacienteSelecionado.nome}\nMédico: ${nomeMedico}\nPrioridade: ${prioridade}`);
      
      fecharModal();
    } catch (error) {
      alert("Erro ao gerar atendimento.");
      console.error(error);
    }
  }

  function fecharModal() {
    setModalAberto(false);
    setPacienteSelecionado(null);
    setTermoBusca("");
    setModoCadastro(false);
    setPrioridade("NORMAL");
    setMedicoSelecionado("");
    setNovoPaciente({ nome: "", cpf: "", dataNasc: "", convenio: "Particular", alergiasComorbidades: "" });
  }

  return (
    <div className="space-y-8 relative">
      
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Recepção</h1>
        <p className="text-gray-500">Gestão de fluxo e atendimento</p>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/recepcao/pacientes" className="group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all cursor-pointer h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="bg-blue-100 p-4 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <UserPlus size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-700">Gestão de Pacientes</h3>
              <p className="text-sm text-gray-400">Ver lista completa ou editar</p>
            </div>
          </div>
        </Link>

        <Link href="/recepcao/agenda" className="group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-green-200 transition-all cursor-pointer h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="bg-green-100 p-4 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <Calendar size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-700">Agenda do Dia</h3>
              <p className="text-sm text-gray-400">Pacientes agendados previamente</p>
            </div>
          </div>
        </Link>

        {/* Botão Roxo */}
        <div className="bg-gradient-to-br from-purple-700 to-indigo-800 p-6 rounded-xl shadow-md text-white flex flex-col justify-between h-full">
          <div>
            <div className="bg-white/20 w-fit p-2 rounded mb-3">
              <Clock size={24} />
            </div>
            <h3 className="text-xl font-bold">Atendimento Imediato</h3>
            <p className="text-purple-200 text-sm mt-1">
              Chegou agora? Busque ou cadastre e gere a senha em segundos.
            </p>
          </div>
          <button 
            onClick={() => setModalAberto(true)}
            className="bg-white text-purple-800 py-3 px-4 rounded-lg font-bold hover:bg-purple-50 transition-colors w-full mt-4 shadow-lg"
          >
            Iniciar Atendimento
          </button>
        </div>
      </div>

      {/* --- MODAL UNIFICADO --- */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh]">
            
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <Clock size={20} className="text-purple-600" /> Novo Atendimento
              </h3>
              <button onClick={fecharModal}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
            </div>

            <div className="p-6 overflow-y-auto">
              
              {/* ETAPA 1: Buscar Paciente */}
              {!pacienteSelecionado && !modoCadastro && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Quem será atendido?</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Digite o Nome ou CPF..." 
                        className="w-full pl-10 p-3 border rounded-lg focus:ring-2 ring-purple-500 outline-none"
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {resultados.map(p => (
                      <div key={p.id} onClick={() => setPacienteSelecionado(p)} className="flex justify-between items-center p-3 border rounded hover:bg-purple-50 cursor-pointer transition-colors group">
                        <div>
                          <p className="font-bold text-gray-700 group-hover:text-purple-700">{p.nome}</p>
                          <p className="text-xs text-gray-500">{p.cpf} • {p.convenio}</p>
                        </div>
                        <CheckCircle size={18} className="text-gray-300 group-hover:text-purple-600" />
                      </div>
                    ))}
                    
                    {termoBusca.length > 1 && resultados.length === 0 && (
                      <div className="text-center p-4 text-gray-500 bg-gray-50 rounded">
                        Nenhum paciente encontrado.
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <button 
                      onClick={() => setModoCadastro(true)}
                      className="w-full py-3 text-purple-700 font-bold hover:bg-purple-50 rounded-lg border border-dashed border-purple-300 flex justify-center items-center gap-2"
                    >
                      <UserPlus size={20} /> Cadastrar Novo Paciente Agora
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 2: Cadastro Completo */}
              {modoCadastro && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-gray-700 text-lg">Cadastro de Paciente</h4>
                    <span className="text-xs text-gray-400">* Campos obrigatórios</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-gray-500">Nome Completo *</label>
                        <input type="text" className="w-full border p-2 rounded focus:outline-blue-500" 
                        value={novoPaciente.nome} onChange={e => setNovoPaciente({...novoPaciente, nome: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="text-xs font-semibold text-gray-500">CPF *</label>
                        <input type="text" className="w-full border p-2 rounded focus:outline-blue-500" 
                        value={novoPaciente.cpf} onChange={e => setNovoPaciente({...novoPaciente, cpf: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="text-xs font-semibold text-gray-500">Data Nasc. *</label>
                        <input type="date" className="w-full border p-2 rounded focus:outline-blue-500" 
                        value={novoPaciente.dataNasc} onChange={e => setNovoPaciente({...novoPaciente, dataNasc: e.target.value})} />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500">Convênio</label>
                        <select className="w-full border p-2 rounded focus:outline-blue-500 bg-white"
                            value={novoPaciente.convenio} onChange={e => setNovoPaciente({...novoPaciente, convenio: e.target.value})}>
                            <option value="Particular">Particular</option>
                            <option value="Unimed">Unimed</option>
                            <option value="Bradesco">Bradesco</option>
                            <option value="SUS">SUS</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-gray-500">Alergias / Comorbidades</label>
                        <input type="text" placeholder="Ex: Diabético, Alergia a Dipirona" className="w-full border p-2 rounded focus:outline-blue-500" 
                        value={novoPaciente.alergiasComorbidades} onChange={e => setNovoPaciente({...novoPaciente, alergiasComorbidades: e.target.value})} />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button onClick={() => setModoCadastro(false)} className="flex-1 py-2 text-gray-600 border rounded hover:bg-gray-50">Cancelar</button>
                    <button onClick={cadastrarPaciente} className="flex-1 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                        <Save size={18} /> Salvar e Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 3: Configurar Atendimento */}
              {pacienteSelecionado && (
                <div className="space-y-6 animate-in fade-in zoom-in duration-200">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-green-600 font-bold uppercase mb-1">Paciente Selecionado</p>
                        <h2 className="text-xl font-bold text-gray-800">{pacienteSelecionado.nome}</h2>
                        <p className="text-sm text-gray-500">{pacienteSelecionado.convenio}</p>
                    </div>
                    <button onClick={() => setPacienteSelecionado(null)} className="text-sm text-green-700 underline">Alterar</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Prioridade */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">Classificação de Prioridade</label>
                        <select
                        className="w-full p-3 border rounded bg-white focus:ring-2 ring-green-500 outline-none"
                        value={prioridade}
                        onChange={(e) => setPrioridade(e.target.value)}
                        >
                        <option value="NORMAL">Normal</option>
                        <option value="PREFERENCIAL">Preferencial (60+, Gestantes)</option>
                        <option value="ALTA_PRIORIDADE">Prioridade Máxima (80+, PCD)</option>
                        </select>
                    </div>

                    {/* Escolha do Médico */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Stethoscope size={16} /> Preferência de Médico
                        </label>
                        <select
                        className="w-full p-3 border rounded bg-white focus:ring-2 ring-blue-500 outline-none"
                        value={medicoSelecionado}
                        onChange={(e) => setMedicoSelecionado(e.target.value)}
                        >
                        <option value="">Sem preferência (Primeiro disponível)</option>
                        {listaMedicos.map(medico => (
                            <option key={medico.id} value={medico.id}>{medico.nome}</option>
                        ))}
                        </select>
                    </div>
                  </div>

                  <button 
                    onClick={confirmarAtendimento}
                    className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 shadow-lg flex items-center justify-center gap-2 text-lg mt-4"
                  >
                    <CheckCircle size={24} /> Confirmar Chegada
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}