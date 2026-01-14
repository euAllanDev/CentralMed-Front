"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/services/api";
import {
  UserPlus,
  Calendar,
  Clock,
  Search,
  X,
  CheckCircle,
  Stethoscope,
  Save,
} from "lucide-react";

export default function RecepcaoDashboard() {
  const [modalAberto, setModalAberto] = useState(false);

  // Dados para Listas
  const [todosPacientes, setTodosPacientes] = useState([]);
  const [listaMedicos, setListaMedicos] = useState([]);

  // Busca
  const [termoBusca, setTermoBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);

  // Novo Cadastro (Completo)
  const [modoCadastro, setModoCadastro] = useState(false);
  const [novoPaciente, setNovoPaciente] = useState({
    nome: "",
    cpf: "",
    dataNasc: "",
    convenio: "Particular",
    alergiasComorbidades: "",
  });

  // Configuração do Atendimento
  const [prioridade, setPrioridade] = useState("NORMAL");
  const [medicoSelecionado, setMedicoSelecionado] = useState("");

  // Estado para a data (Correção do Erro de Hidratação)
  const [dataAtual, setDataAtual] = useState("");
  useEffect(() => {
    setDataAtual(new Date().toLocaleDateString("pt-BR"));
  }, []);

  // Carrega dados iniciais
  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  async function carregarDadosIniciais() {
    try {
      const resPacientes = await api.get("/recepcao/pacientes");
      setTodosPacientes(resPacientes.data);

      const resMedicos = await api.get("/admin/profissionais/medicos");
      setListaMedicos(resMedicos.data);
    } catch (error) {
      console.error("Erro ao carregar dados.", error);
    }
  }

  // Filtra busca
  useEffect(() => {
    if (termoBusca.length < 2) {
      setResultados([]);
      return;
    }
    const filtrados = todosPacientes.filter(
      (p) =>
        p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        p.cpf.includes(termoBusca)
    );
    setResultados(filtrados);
  }, [termoBusca, todosPacientes]);

  // Cadastrar Paciente
  async function cadastrarPaciente() {
    if (!novoPaciente.nome || !novoPaciente.cpf || !novoPaciente.dataNasc) {
      return alert("Preencha os campos obrigatórios (*).");
    }
    try {
      const res = await api.post("/recepcao/pacientes", novoPaciente);
      alert("Paciente cadastrado com sucesso!");
      setTodosPacientes([...todosPacientes, res.data]);
      setPacienteSelecionado(res.data);
      setModoCadastro(false);
    } catch (error) {
      alert("Erro ao cadastrar. Verifique se o CPF já existe.");
    }
  }

  // Confirmar Atendimento
  async function confirmarAtendimento() {
    if (!pacienteSelecionado) return;
    try {
      const payload = {
        pacienteId: pacienteSelecionado.id,
        medicoId: medicoSelecionado || null,
        prioridade: prioridade,
      };
      const response = await api.post(
        "/recepcao/atendimento-imediato",
        payload
      );
      const nomeMedico =
        listaMedicos.find((m) => m.id == medicoSelecionado)?.nome ||
        "Qualquer Médico";
      alert(`Senha Gerada: ${response.data.senhaPainel}\nFila: ${nomeMedico}`);
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
    setNovoPaciente({
      nome: "",
      cpf: "",
      dataNasc: "",
      convenio: "Particular",
      alergiasComorbidades: "",
    });
  }

  return (
    <div className="space-y-8 bg-gray-50 min-h-full p-2">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Painel da Recepção
          </h1>
          <p className="text-gray-500 mt-1">Gestão de fluxo e atendimento</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-blue-600">{dataAtual}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row h-full">
            <div className="bg-blue-600 p-8 flex flex-col justify-center text-white md:w-1/3">
              <Clock size={48} className="mb-4 opacity-90" />
              <h2 className="text-2xl font-bold mb-2">Atendimento Imediato</h2>
              <p className="text-blue-100 text-sm">
                Para pacientes sem hora marcada.
              </p>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-center items-start bg-white">
              <h3 className="text-gray-800 font-bold text-lg mb-2">
                Fluxo de Encaixe / Walk-in
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Busque ou cadastre e gere a senha para a triagem.
              </p>
              <button
                onClick={() => setModalAberto(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2"
              >
                <CheckCircle size={20} /> Iniciar Agora
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <Link href="/recepcao/agenda" className="block group">
            <div className="bg-white p-5 rounded-xl shadow-sm border hover:border-blue-300 transition-all flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg text-green-600">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-700">Agenda do Dia</h3>
                <p className="text-xs text-gray-400">Ver fila de hoje</p>
              </div>
            </div>
          </Link>
          <Link href="/recepcao/pacientes" className="block group">
            <div className="bg-white p-5 rounded-xl shadow-sm border hover:border-blue-300 transition-all flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                <UserPlus size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-700">Base de Pacientes</h3>
                <p className="text-xs text-gray-400">Cadastrar ou editar</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <Clock size={20} className="text-blue-600" /> Novo Atendimento
              </h3>
              <button onClick={fecharModal}>
                <X size={20} className="text-gray-400 hover:text-red-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {!pacienteSelecionado && !modoCadastro && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-3 text-gray-400"
                      size={20}
                    />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Digite o Nome ou CPF..."
                      className="w-full pl-10 p-3 border rounded-lg focus:ring-2 ring-blue-500 outline-none text-gray-800"
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {resultados.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setPacienteSelecionado(p)}
                        className="flex justify-between items-center p-3 border rounded hover:bg-blue-50 cursor-pointer"
                      >
                        <div>
                          <p className="font-bold">{p.nome}</p>
                          <p className="text-xs text-gray-500">{p.cpf}</p>
                        </div>
                        <CheckCircle size={18} className="text-gray-300" />
                      </div>
                    ))}
                    {termoBusca.length > 1 && resultados.length === 0 && (
                      <div className="text-center p-4 text-gray-500 bg-gray-50 rounded">
                        Nenhum paciente.
                      </div>
                    )}
                  </div>
                  <div className="border-t pt-4">
                    <button
                      onClick={() => setModoCadastro(true)}
                      className="w-full py-3 text-blue-700 font-bold hover:bg-blue-50 rounded-lg border border-dashed flex justify-center gap-2"
                    >
                      <UserPlus size={20} /> Cadastrar Novo Paciente
                    </button>
                  </div>
                </div>
              )}
              {modoCadastro && (
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-700 text-lg">
                    Ficha de Cadastro
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label>Nome Completo *</label>
                      <input
                        type="text"
                        className="w-full border p-2 rounded"
                        value={novoPaciente.nome}
                        onChange={(e) =>
                          setNovoPaciente({
                            ...novoPaciente,
                            nome: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label>CPF *</label>
                      <input
                        type="text"
                        className="w-full border p-2 rounded"
                        value={novoPaciente.cpf}
                        onChange={(e) =>
                          setNovoPaciente({
                            ...novoPaciente,
                            cpf: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label>Data Nasc. *</label>
                      <input
                        type="date"
                        className="w-full border p-2 rounded"
                        value={novoPaciente.dataNasc}
                        onChange={(e) =>
                          setNovoPaciente({
                            ...novoPaciente,
                            dataNasc: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t">
                    <button onClick={() => setModoCadastro(false)}>
                      Cancelar
                    </button>
                    <button onClick={cadastrarPaciente}>
                      <Save size={18} /> Salvar e Continuar
                    </button>
                  </div>
                </div>
              )}
              {pacienteSelecionado && (
                <div className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                      {pacienteSelecionado.nome}
                    </h2>
                    <button onClick={() => setPacienteSelecionado(null)}>
                      Alterar
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label>Prioridade</label>
                      <select
                        className="w-full p-3 border rounded-lg bg-white"
                        value={prioridade}
                        onChange={(e) => setPrioridade(e.target.value)}
                      >
                        <option value="NORMAL">Normal</option>
                        <option value="PREFERENCIAL">Preferencial</option>
                        <option value="ALTA_PRIORIDADE">
                          Prioridade Máxima
                        </option>
                      </select>
                    </div>
                    <div>
                      <label>Médico</label>
                      <select
                        className="w-full p-3 border rounded-lg bg-white"
                        value={medicoSelecionado}
                        onChange={(e) => setMedicoSelecionado(e.target.value)}
                      >
                        <option value="">Sem preferência</option>
                        {listaMedicos.map((medico) => (
                          <option key={medico.id} value={medico.id}>
                            {medico.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={confirmarAtendimento}
                    className="w-full bg-green-600 text-white py-4 rounded-lg font-bold"
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
