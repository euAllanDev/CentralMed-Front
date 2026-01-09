"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Plus, Search, User, Calendar as CalIcon, Edit, Trash2, Save, X } from "lucide-react";

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
    convenio: "Particular",
    alergiasComorbidades: "",
  };
  const [novoPaciente, setNovoPaciente] = useState(initialFormState);

  useEffect(() => {
    carregarPacientes();
  }, []);

  async function carregarPacientes() {
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
      dataNasc: paciente.dataNasc ? new Date(paciente.dataNasc).toISOString().split('T')[0] : "", 
      convenio: paciente.convenio,
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
    if(!novoPaciente.nome || !novoPaciente.cpf) return alert("Preencha nome e CPF.");

    try {
      if (isEditing) {
        // MODO EDIÇÃO (PUT)
        await api.put(`/recepcao/pacientes/${editId}`, novoPaciente);
        alert("Paciente atualizado com sucesso!");
      } else {
        // MODO CRIAÇÃO (POST)
        await api.post("/recepcao/pacientes", novoPaciente);
        alert("Paciente cadastrado com sucesso!");
      }
      
      cancelarEdicao(); // Limpa form e estado
      carregarPacientes(); // Recarrega lista
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar. Verifique os dados.");
    }
  }

  // Lógica de Filtro (Busca Local)
  const pacientesFiltrados = pacientes.filter(p => 
    p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    p.cpf.includes(termoBusca)
  );

  return (
    <div className="space-y-6 bg-gray-50 min-h-full p-2">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestão de Pacientes</h2>
          <p className="text-gray-500 text-sm">Cadastre, edite e consulte o histórico.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA 1: Formulário (Adaptável para Criar/Editar) */}
        <div className={`p-6 rounded-xl shadow-sm border h-fit transition-colors ${isEditing ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isEditing ? 'text-blue-700' : 'text-gray-700'}`}>
            {isEditing ? <Edit size={20} /> : <Plus size={20} />} 
            {isEditing ? "Editar Paciente" : "Novo Cadastro"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nome Completo</label>
              <input
                type="text"
                placeholder="Ex: Maria da Silva"
                className="w-full border p-2 rounded focus:outline-blue-500 bg-white text-gray-900"
                value={novoPaciente.nome}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, nome: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">CPF</label>
                    <input
                        type="text"
                        placeholder="000.000.000-00"
                        className="w-full border p-2 rounded focus:outline-blue-500 bg-white text-gray-900"
                        value={novoPaciente.cpf}
                        onChange={(e) => setNovoPaciente({ ...novoPaciente, cpf: e.target.value })}
                        required
                        disabled={isEditing} // CPF geralmente não se muda, mas pode remover o disabled se quiser
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nascimento</label>
                    <input
                        type="date"
                        className="w-full border p-2 rounded focus:outline-blue-500 bg-white text-gray-900"
                        value={novoPaciente.dataNasc}
                        onChange={(e) => setNovoPaciente({ ...novoPaciente, dataNasc: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Convênio</label>
              <select
                className="w-full border p-2 rounded focus:outline-blue-500 bg-white text-gray-900"
                value={novoPaciente.convenio}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, convenio: e.target.value })}
              >
                <option value="Particular">Particular</option>
                <option value="Unimed">Unimed</option>
                <option value="Bradesco">Bradesco</option>
                <option value="SUS">SUS</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Alergias / Obs.</label>
              <textarea
                rows="2"
                placeholder="Ex: Alergia a Dipirona..."
                className="w-full border p-2 rounded focus:outline-blue-500 bg-white text-gray-900 resize-none"
                value={novoPaciente.alergiasComorbidades}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, alergiasComorbidades: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
                {isEditing && (
                    <button
                        type="button"
                        onClick={cancelarEdicao}
                        className="flex-1 bg-gray-200 text-gray-700 p-3 rounded-lg font-bold hover:bg-gray-300 transition-colors flex justify-center items-center gap-2"
                    >
                        <X size={18} /> Cancelar
                    </button>
                )}
                <button
                type="submit"
                className={`flex-1 text-white p-3 rounded-lg font-bold transition-colors shadow-md flex justify-center items-center gap-2 ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                <Save size={18} /> {isEditing ? "Atualizar" : "Salvar"}
                </button>
            </div>
          </form>
        </div>

        {/* COLUNA 2 e 3: Lista de Pacientes */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          
          {/* Barra de Busca */}
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center gap-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <User size={20} /> Base de Dados
            </h3>
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por Nome ou CPF..."
                className="w-full pl-10 p-2 border rounded-lg focus:outline-blue-500 text-sm bg-white text-gray-800"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {loading ? (
              <p className="p-8 text-center text-gray-500">Carregando lista...</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold sticky top-0">
                  <tr>
                    <th className="p-4">Nome / CPF</th>
                    <th className="p-4">Nascimento</th>
                    <th className="p-4">Convênio</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pacientesFiltrados.map((paciente) => (
                    <tr key={paciente.id} className={`transition-colors border-l-4 ${isEditing && editId === paciente.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50 border-transparent'}`}>
                      <td className="p-4">
                        <p className="font-bold text-gray-800 text-base">{paciente.nome}</p>
                        <p className="text-xs text-gray-500 font-mono">{paciente.cpf}</p>
                      </td>
                      <td className="p-4 text-gray-600">
                        <div className="flex items-center gap-2">
                            <CalIcon size={14} className="text-gray-400"/>
                            {paciente.dataNasc ? new Date(paciente.dataNasc).toLocaleDateString('pt-BR') : '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${
                            paciente.convenio === 'Particular' ? 'bg-green-100 text-green-700 border-green-200' :
                            paciente.convenio === 'SUS' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                            'bg-blue-100 text-blue-700 border-blue-200'
                        }`}>
                          {paciente.convenio}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                            <button 
                                onClick={() => iniciarEdicao(paciente)}
                                className="p-2 hover:bg-blue-100 text-blue-600 rounded transition-colors" 
                                title="Editar"
                            >
                                <Edit size={16} />
                            </button>
                            <button 
                                className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors" 
                                title="Excluir (Indisponível)"
                                onClick={() => alert("Exclusão desativada por segurança.")}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pacientesFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-12 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                            <Search size={32} className="opacity-20"/>
                            <p>Nenhum paciente encontrado.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}