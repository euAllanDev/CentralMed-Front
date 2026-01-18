"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/services/api";
import EmailService from "@/services/EmailService";
import {
  UserPlus,
  Calendar,
  Clock,
  Search,
  X,
  CheckCircle,
  Stethoscope,
  Save,
  ArrowLeft,
  AlertCircle,
  ChevronRight,
  User,
} from "lucide-react";

export default function RecepcaoDashboard() {
  const [modalAberto, setModalAberto] = useState(false);
  const [todosPacientes, setTodosPacientes] = useState([]);
  const [listaMedicos, setListaMedicos] = useState([]);
  const [loadingDados, setLoadingDados] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [termoBusca, setTermoBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [modoCadastro, setModoCadastro] = useState(false);

  const initialFormState = {
    nome: "",
    cpf: "",
    dataNasc: "",
    convenio: "Particular",
    alergiasComorbidades: "",
    email: "",
  };
  const [novoPaciente, setNovoPaciente] = useState(initialFormState);

  const [prioridade, setPrioridade] = useState("NORMAL");
  const [medicoSelecionado, setMedicoSelecionado] = useState("");
  const [dataAtual, setDataAtual] = useState("");

  useEffect(() => {
    const hoje = new Date();
    const opcoes = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setDataAtual(hoje.toLocaleDateString("pt-BR", opcoes));
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    if (termoBusca.length < 2) {
      setResultados([]);
      return;
    }
    const termoLower = termoBusca.toLowerCase();
    const filtrados = todosPacientes.filter(
      (p) =>
        p.nome.toLowerCase().includes(termoLower) ||
        String(p.cpf).includes(termoLower),
    );
    setResultados(filtrados);
  }, [termoBusca, todosPacientes]);

  async function carregarDadosIniciais() {
    setLoadingDados(true);
    try {
      const [resPacientes, resMedicos] = await Promise.all([
        api.get("/recepcao/pacientes"),
        api.get("/admin/profissionais/medicos"),
      ]);
      setTodosPacientes(
        Array.isArray(resPacientes.data) ? resPacientes.data : [],
      );
      setListaMedicos(Array.isArray(resMedicos.data) ? resMedicos.data : []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoadingDados(false);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoPaciente((prev) => ({ ...prev, [name]: value }));
  };

  async function cadastrarPaciente() {
    if (!novoPaciente.nome || !novoPaciente.cpf) {
      return alert("Por favor, preencha Nome e CPF.");
    }
    setLoadingAction(true);
    try {
      const res = await api.post("/recepcao/pacientes", novoPaciente);
      const criado = res.data;
      setTodosPacientes((prev) => [...prev, criado]);
      setPacienteSelecionado(criado);
      setModoCadastro(false);
      setNovoPaciente(initialFormState);
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      alert("Erro ao cadastrar paciente. O CPF pode já existir.");
    } finally {
      setLoadingAction(false);
    }
  }

  async function confirmarAtendimento() {
    if (!pacienteSelecionado) return;
    setLoadingAction(true);
    try {
      const payload = {
        pacienteId: pacienteSelecionado.id,
        medicoId: medicoSelecionado || null,
        prioridade,
      };
      const response = await api.post(
        "/recepcao/atendimento-imediato",
        payload,
      );

      const nomeMedico =
        listaMedicos.find((m) => m.id == medicoSelecionado)?.nome ||
        "Fila Geral";
      alert(
        `Atendimento iniciado!\n\nSenha: ${response.data.senhaPainel}\nFila: ${nomeMedico}`,
      );

      EmailService.sendReminder(response.data)
        .then(() => console.log("Email de notificação disparado."))
        .catch((err) => console.error("Falha ao enviar email:", err));

      fecharModal();
    } catch (error) {
      console.error("Erro ao iniciar atendimento:", error);
      alert("Erro ao confirmar atendimento.");
    } finally {
      setLoadingAction(false);
    }
  }

  function fecharModal() {
    setModalAberto(false);
    setTimeout(() => {
      setPacienteSelecionado(null);
      setModoCadastro(false);
      setTermoBusca("");
      setResultados([]);
      setPrioridade("NORMAL");
      setMedicoSelecionado("");
      setNovoPaciente(initialFormState);
    }, 200);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Painel da Recepção
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            Sistema Operacional
          </p>
        </div>
        <div className="text-right bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
            Hoje
          </p>
          <p className="text-sm font-semibold text-blue-700 capitalize">
            {dataAtual}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row h-full transition-shadow hover:shadow-md">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white md:w-1/3 flex flex-col justify-center items-center text-center">
              <div className="bg-white/20 p-4 rounded-full mb-4">
                <Clock size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold">Atendimento Rápido</h2>
              <p className="text-blue-100 text-sm mt-2">
                Check-in de pacientes
              </p>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-center items-start bg-white">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Fluxo de Encaixe & Chegada
              </h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Utilize este painel para registrar a chegada de pacientes ou
                criar fichas para atendimentos de emergência.
              </p>
              <button
                onClick={() => setModalAberto(true)}
                className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-1"
              >
                <UserPlus size={20} />
                Iniciar Novo Atendimento
                <ChevronRight
                  size={16}
                  className="opacity-50 group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <Link href="/recepcao/agenda" className="block group">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 group-hover:border-blue-300 group-hover:shadow-md transition-all flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                <Calendar size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Agenda do Dia</h4>
                <p className="text-sm text-gray-500">Visualizar marcações</p>
              </div>
            </div>
          </Link>
          <Link href="/recepcao/pacientes" className="block group">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 group-hover:border-blue-300 group-hover:shadow-md transition-all flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg text-green-600">
                <Search size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Base de Pacientes</h4>
                <p className="text-sm text-gray-500">
                  Buscar históricos e dados
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
      {modalAberto && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {(modoCadastro || pacienteSelecionado) && (
                  <button
                    onClick={() => {
                      if (modoCadastro) setModoCadastro(false);
                      else setPacienteSelecionado(null);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    title="Voltar"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <h3 className="font-bold text-lg text-gray-800">
                  {modoCadastro
                    ? "Novo Cadastro"
                    : pacienteSelecionado
                      ? "Confirmar Chegada"
                      : "Buscar Paciente"}
                </h3>
              </div>
              <button
                onClick={fecharModal}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {!pacienteSelecionado && !modoCadastro && (
                <div className="space-y-6">
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Digite o Nome completo ou CPF..."
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg transition-all shadow-sm"
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 min-h-[200px]">
                    {termoBusca.length > 1 && resultados.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <UserPlus
                          size={48}
                          className="mx-auto text-gray-300 mb-2"
                        />
                        <p>Nenhum paciente encontrado.</p>
                      </div>
                    )}
                    {resultados.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPacienteSelecionado(p)}
                        className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all flex justify-between items-center group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-full text-blue-600 group-hover:bg-blue-200">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{p.nome}</p>
                            <p className="text-sm text-gray-500">
                              CPF: {p.cpf}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          size={18}
                          className="text-gray-300 group-hover:text-blue-500"
                        />
                      </button>
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <button
                      onClick={() => setModoCadastro(true)}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-semibold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex justify-center items-center gap-2"
                    >
                      <UserPlus size={18} />
                      Não encontrou? Cadastrar Novo Paciente
                    </button>
                  </div>
                </div>
              )}
              {modoCadastro && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3 items-start mb-4">
                    <AlertCircle
                      className="text-blue-600 shrink-0 mt-0.5"
                      size={18}
                    />{" "}
                    <p className="text-sm text-blue-800">
                      Preencha os dados básicos para criar a ficha rápida. Dados
                      completos podem ser adicionados depois.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        name="nome"
                        value={novoPaciente.nome}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CPF *
                      </label>
                      <input
                        type="text"
                        name="cpf"
                        placeholder="000.000.000-00"
                        value={novoPaciente.cpf}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Nascimento
                      </label>
                      <input
                        type="date"
                        name="dataNasc"
                        value={novoPaciente.dataNasc}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Convênio
                      </label>
                      <select
                        name="convenio"
                        value={novoPaciente.convenio}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="Particular">Particular</option>
                        <option value="Unimed">Unimed</option>
                        <option value="Bradesco">Bradesco</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email (Para notificações)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={novoPaciente.email}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button
                      onClick={() => setModoCadastro(false)}
                      className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={cadastrarPaciente}
                      disabled={loadingAction}
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                    >
                      {loadingAction ? (
                        "Salvando..."
                      ) : (
                        <>
                          <Save size={18} />
                          Salvar Cadastro
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              {pacienteSelecionado && !modoCadastro && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">
                        {pacienteSelecionado.nome}
                      </h4>
                      <p className="text-gray-500 text-sm">
                        CPF: {pacienteSelecionado.cpf}
                      </p>
                    </div>
                    <button
                      onClick={() => setPacienteSelecionado(null)}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Trocar Paciente
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridade
                      </label>
                      <select
                        value={prioridade}
                        onChange={(e) => setPrioridade(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="NORMAL">Normal</option>
                        <option value="PREFERENCIAL">
                          Preferencial (Idoso/Gestante)
                        </option>
                        <option value="ALTA_PRIORIDADE">Emergência</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Médico (Opcional)
                      </label>
                      <div className="relative">
                        <Stethoscope
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <select
                          value={medicoSelecionado}
                          onChange={(e) => setMedicoSelecionado(e.target.value)}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                          <option value="">Qualquer disponível</option>
                          {listaMedicos.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6">
                    <button
                      onClick={confirmarAtendimento}
                      disabled={loadingAction}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                      {loadingAction ? (
                        "Processando..."
                      ) : (
                        <>
                          <CheckCircle size={24} />
                          Confirmar Chegada
                        </>
                      )}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3">
                      Ao confirmar, uma senha será gerada para o painel.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
