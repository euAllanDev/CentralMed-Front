"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import {
  Plus,
  Search,
  User,
  Calendar as CalIcon,
  Edit,
  Trash2,
  Save,
  X,
  FileText,
  Activity,
  Loader2,
} from "lucide-react";

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");

  // Estados de Controle de Edição
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Estado do Formulário
  const initialFormState = {
    nome: "",
    cpf: "",
    dataNasc: "",
    convenio: "Particular", // Valor padrão simples
    alergiasComorbidades: "",
  };
  const [novoPaciente, setNovoPaciente] = useState(initialFormState);

  useEffect(() => {
    carregarPacientes();
  }, []);

  async function carregarPacientes() {
    setLoading(true);
    try {
      const response = await api.get("/recepcao/pacientes");
      setPacientes(response.data);
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error);
    } finally {
      setLoading(false);
    }
  }

  // Preenche o formulário com os dados da linha clicada
  function iniciarEdicao(paciente) {
    setIsEditing(true);
    setEditId(paciente.id);
    setNovoPaciente({
      nome: paciente.nome,
      cpf: paciente.cpf,
      // Garante formato yyyy-mm-dd para o input date
      dataNasc: paciente.dataNasc
        ? new Date(paciente.dataNasc).toISOString().split("T")[0]
        : "",
      // CORREÇÃO: Extrai o nome do objeto convênio ou usa padrão
      convenio: paciente.convenio?.nome || "Particular",
      alergiasComorbidades: paciente.alergiasComorbidades || "",
    });
  }

  function cancelarEdicao() {
    setIsEditing(false);
    setEditId(null);
    setNovoPaciente(initialFormState);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!novoPaciente.nome || !novoPaciente.cpf)
      return alert("Preencha nome e CPF.");

    try {
      if (isEditing) {
        await api.put(`/recepcao/pacientes/${editId}`, novoPaciente);
        alert("Paciente atualizado com sucesso!");
      } else {
        await api.post("/recepcao/pacientes", novoPaciente);
        alert("Paciente cadastrado com sucesso!");
      }
      cancelarEdicao();
      carregarPacientes();
    } catch (error) {
      console.error(error);
      alert(
        "Erro ao salvar. Verifique se o CPF já existe ou se o servidor está online.",
      );
    }
  }

  // Lógica de Filtro
  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      p.cpf.includes(termoBusca),
  );

  // Helper para cor do badge
  const getConvenioColor = (nome) => {
    const n = nome?.toLowerCase() || "";
    if (n.includes("particular"))
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (n.includes("sus")) return "bg-gray-100 text-gray-700 border-gray-200";
    if (n.includes("unimed"))
      return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      {/* Cabeçalho */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Pacientes
          </h1>
          <p className="text-slate-500 mt-1">
            Gestão de cadastro e histórico de atendimento.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400 bg-white px-3 py-1 rounded-full border shadow-sm">
          <Activity size={16} className="text-emerald-500" />
          <span>Sistema Operacional</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUNA 1: Formulário (4 colunas no grid largo) */}
        <div className="lg:col-span-4 space-y-6">
          <div
            className={`rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 ${isEditing ? "bg-white ring-2 ring-indigo-500/20 border-indigo-200" : "bg-white border-slate-200"}`}
          >
            {/* Header do Form */}
            <div
              className={`p-5 border-b flex items-center gap-3 ${isEditing ? "bg-indigo-50 border-indigo-100" : "bg-slate-50 border-slate-100"}`}
            >
              <div
                className={`p-2 rounded-lg ${isEditing ? "bg-indigo-600 text-white" : "bg-slate-800 text-white"}`}
              >
                {isEditing ? <Edit size={20} /> : <Plus size={20} />}
              </div>
              <h3
                className={`font-bold text-lg ${isEditing ? "text-indigo-900" : "text-slate-700"}`}
              >
                {isEditing ? "Editando Paciente" : "Novo Paciente"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Ex: Ana Maria Souza"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-slate-800"
                    value={novoPaciente.nome}
                    onChange={(e) =>
                      setNovoPaciente({ ...novoPaciente, nome: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                    value={novoPaciente.cpf}
                    onChange={(e) =>
                      setNovoPaciente({ ...novoPaciente, cpf: e.target.value })
                    }
                    required
                    disabled={isEditing}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                    Nascimento
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-slate-800"
                    value={novoPaciente.dataNasc}
                    onChange={(e) =>
                      setNovoPaciente({
                        ...novoPaciente,
                        dataNasc: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                  Convênio
                </label>
                <div className="relative">
                  <FileText
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <select
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-slate-800 appearance-none cursor-pointer"
                    value={novoPaciente.convenio}
                    onChange={(e) =>
                      setNovoPaciente({
                        ...novoPaciente,
                        convenio: e.target.value,
                      })
                    }
                  >
                    <option value="Particular">Particular</option>
                    <option value="Unimed">Unimed</option>
                    <option value="Bradesco">Bradesco</option>
                    <option value="Amil">Amil</option>
                    <option value="SUS">SUS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                  Alergias / Observações
                </label>
                <textarea
                  rows="3"
                  placeholder="Ex: Diabético, Alergia a Penicilina..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-slate-800 resize-none"
                  value={novoPaciente.alergiasComorbidades}
                  onChange={(e) =>
                    setNovoPaciente({
                      ...novoPaciente,
                      alergiasComorbidades: e.target.value,
                    })
                  }
                />
              </div>

              <div className="pt-2 flex gap-3">
                {isEditing && (
                  <button
                    type="button"
                    onClick={cancelarEdicao}
                    className="flex-1 bg-white border-2 border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-800 transition-colors flex justify-center items-center gap-2"
                  >
                    <X size={18} /> Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transform active:scale-95 transition-all flex justify-center items-center gap-2 ${
                    isEditing
                      ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                      : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                  }`}
                >
                  <Save size={18} />{" "}
                  {isEditing ? "Salvar Alterações" : "Cadastrar Paciente"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* COLUNA 2: Lista (8 colunas no grid largo) */}
        <div className="lg:col-span-8 flex flex-col h-[600px] bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Barra de Ferramentas da Tabela */}
          <div className="p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
              <User size={20} className="text-indigo-500" />
              Base de Pacientes
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {pacientesFiltrados.length}
              </span>
            </h3>

            <div className="relative w-full sm:w-72">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar por nome ou CPF..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 focus:bg-white text-slate-700"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 size={40} className="animate-spin text-indigo-500" />
                <p>Carregando dados...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 font-bold tracking-wider">Paciente</th>
                    <th className="p-4 font-bold tracking-wider">Nascimento</th>
                    <th className="p-4 font-bold tracking-wider">Convênio</th>
                    <th className="p-4 font-bold tracking-wider text-center">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pacientesFiltrados.map((paciente) => (
                    <tr
                      key={paciente.id}
                      className={`group transition-all hover:bg-slate-50 ${
                        isEditing && editId === paciente.id
                          ? "bg-indigo-50/60 border-l-4 border-indigo-500"
                          : "border-l-4 border-transparent"
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-sm md:text-base group-hover:text-indigo-700 transition-colors">
                            {paciente.nome}
                          </span>
                          <span className="text-xs text-slate-400 font-mono mt-0.5">
                            CPF: {paciente.cpf}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <CalIcon size={14} className="text-slate-400" />
                          {paciente.dataNasc ? (
                            new Date(paciente.dataNasc).toLocaleDateString(
                              "pt-BR",
                            )
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold border ${getConvenioColor(paciente.convenio?.nome)}`}
                        >
                          {paciente.convenio?.nome || "Particular"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => iniciarEdicao(paciente)}
                            className="p-2 bg-white border border-slate-200 text-indigo-600 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-sm"
                            title="Editar Dados"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="p-2 bg-white border border-slate-200 text-rose-500 rounded-lg hover:bg-rose-50 hover:border-rose-200 transition-colors shadow-sm cursor-not-allowed opacity-60"
                            title="Excluir (Desativado)"
                            onClick={() =>
                              alert("Função restrita ao administrador.")
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {pacientesFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="4" className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 text-slate-300">
                          <div className="bg-slate-50 p-4 rounded-full">
                            <Search size={32} />
                          </div>
                          <p className="text-slate-500 font-medium">
                            Nenhum paciente encontrado.
                          </p>
                          <p className="text-sm">
                            Tente buscar por outro termo ou cadastre um novo.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Rodapé da tabela */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-400 text-center">
            Total de registros: {pacientes.length}
          </div>
        </div>
      </div>
    </div>
  );
}
