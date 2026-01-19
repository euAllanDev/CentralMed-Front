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
  const [listaConvenios, setListaConvenios] = useState([]); // <-- LINHA FALTANDO
  // Loading inicial
  const [loadingDados, setLoadingDados] = useState(true);
  // Loading de botões (salvar/confirmar)
  const [loadingAction, setLoadingAction] = useState(false);

  const [termoBusca, setTermoBusca] = useState("");
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

  const resultadosDaBusca =
    termoBusca.length < 2
      ? []
      : todosPacientes.filter(
          (p) =>
            p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            String(p.cpf).includes(termoBusca),
        );

  async function carregarDadosIniciais() {
    setLoadingDados(true);
    try {
      // Exemplo de chamadas (ajuste conforme seu backend real)
      const [resPacientes, resMedicos, resConvenios] = await Promise.all([
        api.get("/recepcao/pacientes"),
        api.get("/admin/profissionais/medicos"),
        api.get("/admin/convenios"),
      ]);
      setTodosPacientes(
        Array.isArray(resPacientes.data) ? resPacientes.data : [],
      );
      setListaMedicos(Array.isArray(resMedicos.data) ? resMedicos.data : []);
      setListaConvenios(
        Array.isArray(resConvenios.data) ? resConvenios.data : [],
      );
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
      return alert("Nome e CPF são obrigatórios.");
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
      alert("Erro ao cadastrar paciente. Verifique se o CPF já existe.");
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

      // --- CORREÇÃO DE LÓGICA AQUI ---
      // 1. Pega o agendamento que voltou da API
      const agendamentoCriado = response.data;

      // 2. "Hidrata" ele com o objeto Paciente COMPLETO que já temos no estado 'pacienteSelecionado'
      const agendamentoParaEmail = {
        ...agendamentoCriado,
        paciente: pacienteSelecionado,
      };

      // 3. Envia o objeto completo para o serviço de email
      EmailService.sendReminder(agendamentoParaEmail)
        .then(() => console.log("Email de notificação disparado."))
        .catch((err) => console.error("Falha ao enviar email:", err));
      // ---------------------------------

      // O resto da sua lógica de alert e fechar modal continua a mesma...
    } catch (error) {
      console.error("Erro ao iniciar atendimento:", error);
      alert("Erro ao confirmar atendimento.");
    } finally {
      setLoadingAction(false);
    }
  }

  function fecharModal() {
    setModalAberto(false);
    // Timeout para limpar o estado apenas após a animação fechar (opcional)
    setTimeout(() => {
      setPacienteSelecionado(null);
      setModoCadastro(false);
      setTermoBusca("");
      setPrioridade("NORMAL");
      setMedicoSelecionado("");
      setNovoPaciente(initialFormState);
    }, 200);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-8 h-8 text-blue-600" />
            Painel da Recepção
          </h1>
          <p className="text-gray-500 mt-1">Gestão de fluxo e atendimento</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-blue-700 capitalize">
            {dataAtual}
          </p>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal: Ações Rápidas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-64">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <UserPlus className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Novo Atendimento
            </h2>
            <p className="text-gray-500 mb-6 max-w-md">
              Inicie a triagem buscando um paciente existente ou cadastrando um
              novo.
            </p>
            <button
              onClick={() => setModalAberto(true)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Buscar ou Cadastrar Paciente
            </button>
          </div>
        </div>

        {/* Coluna Lateral: Status (Placeholder) */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" /> Fila de Espera
            </h3>
            <div className="text-center text-gray-400 py-8">
              Nenhum paciente aguardando no momento.
            </div>
          </div>
        </div>
      </div>

      {/* Modal Principal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header do Modal */}
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                {modoCadastro ? (
                  <>
                    <UserPlus className="w-5 h-5" /> Novo Cadastro
                  </>
                ) : pacienteSelecionado ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" /> Confirmar
                    Chegada
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" /> Buscar Paciente
                  </>
                )}
              </h3>
              <button
                onClick={fecharModal}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Corpo do Modal */}
            <div className="p-6 overflow-y-auto">
              {/* CENÁRIO 1: BUSCA */}
              {!pacienteSelecionado && !modoCadastro && (
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Digite o Nome, CPF ou Telefone..."
                      className="w-full pl-12 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg"
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {termoBusca.length >= 2 &&
                      resultadosDaBusca.length === 0 && (
                        <p className="text-center text-gray-500 py-4">
                          Nenhum paciente encontrado.
                        </p>
                      )}
                    {resultadosDaBusca.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPacienteSelecionado(p)}
                        className="w-full text-left p-4 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all flex justify-between items-center group"
                      >
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            {p.nome}
                          </span>
                          <span className="text-sm text-gray-500">
                            CPF: {p.cpf}
                          </span>
                        </div>
                        <ChevronRight className="text-gray-300 group-hover:text-blue-500" />
                      </button>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <button
                      onClick={() => setModoCadastro(true)}
                      className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-blue-700 font-semibold rounded-xl transition-colors flex justify-center items-center gap-2"
                    >
                      <UserPlus className="w-5 h-5" />
                      Cadastrar Novo Paciente
                    </button>
                  </div>
                </div>
              )}

              {/* CENÁRIO 2: CADASTRO */}
              {modoCadastro && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
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
                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="Particular">Particular</option>
                        {listaConvenios
                          .filter((c) => c.nome !== "Particular")
                          .map((c) => (
                            <option key={c.id} value={c.nome}>
                              {c.nome}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email (Para Notificações)
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
                  <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                    <button
                      onClick={() => setModoCadastro(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={cadastrarPaciente}
                      disabled={loadingAction}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
                    >
                      {loadingAction ? (
                        "Salvando..."
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Salvar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* CENÁRIO 3: CONFIRMAÇÃO */}
              {pacienteSelecionado && !modoCadastro && (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-blue-900 text-lg">
                        {pacienteSelecionado.nome}
                      </h4>
                      <p className="text-sm text-blue-700">
                        CPF: {pacienteSelecionado.cpf}
                      </p>
                    </div>
                    <button
                      onClick={() => setPacienteSelecionado(null)}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Trocar
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
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="NORMAL">Normal</option>
                        <option value="PREFERENCIAL">
                          Preferencial (Idoso/Gestante)
                        </option>
                        <option value="EMERGENCIA">Emergência</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Médico (Opcional)
                      </label>
                      <select
                        value={medicoSelecionado}
                        onChange={(e) => setMedicoSelecionado(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">
                          Qualquer disponível (Fila Geral)
                        </option>
                        {listaMedicos.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-end gap-3">
                    <button
                      onClick={() => setPacienteSelecionado(null)}
                      className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={confirmarAtendimento}
                      disabled={loadingAction}
                      className="flex-1 md:flex-none px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg shadow-green-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {loadingAction ? "Processando..." : "Confirmar Check-in"}
                    </button>
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
