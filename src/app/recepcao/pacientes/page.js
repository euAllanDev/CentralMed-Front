"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Plus, Search } from "lucide-react";

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado do Formulário
  const [novoPaciente, setNovoPaciente] = useState({
    nome: "",
    cpf: "",
    dataNasc: "",
    convenio: "Particular",
    alergiasComorbidades: "",
  });

  // Carregar Pacientes ao abrir a tela
  useEffect(() => {
    carregarPacientes();
  }, []);

  async function carregarPacientes() {
    try {
      const response = await api.get("/recepcao/pacientes");
      setPacientes(response.data);
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/recepcao/pacientes", novoPaciente);
      alert("Paciente cadastrado com sucesso!");
      setNovoPaciente({
        nome: "",
        cpf: "",
        dataNasc: "",
        convenio: "Particular",
        alergiasComorbidades: "",
      });
      carregarPacientes(); // Atualiza a lista
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar.");
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Gestão de Pacientes</h2>

      {/* Formulário de Cadastro Rápido */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus size={20} className="text-blue-500" /> Novo Paciente
        </h3>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            placeholder="Nome Completo"
            className="border p-2 rounded focus:outline-blue-500"
            value={novoPaciente.nome}
            onChange={(e) =>
              setNovoPaciente({ ...novoPaciente, nome: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="CPF (000.000.000-00)"
            className="border p-2 rounded focus:outline-blue-500"
            value={novoPaciente.cpf}
            onChange={(e) =>
              setNovoPaciente({ ...novoPaciente, cpf: e.target.value })
            }
            required
          />
          <input
            type="date"
            className="border p-2 rounded focus:outline-blue-500"
            value={novoPaciente.dataNasc}
            onChange={(e) =>
              setNovoPaciente({ ...novoPaciente, dataNasc: e.target.value })
            }
            required
          />
          <select
            className="border p-2 rounded focus:outline-blue-500"
            value={novoPaciente.convenio}
            onChange={(e) =>
              setNovoPaciente({ ...novoPaciente, convenio: e.target.value })
            }
          >
            <option value="Particular">Particular</option>
            <option value="Unimed">Unimed</option>
            <option value="Bradesco">Bradesco</option>
            <option value="SUS">SUS</option>
          </select>
          <input
            type="text"
            placeholder="Alergias ou Comorbidades"
            className="border p-2 rounded focus:outline-blue-500 md:col-span-2"
            value={novoPaciente.alergiasComorbidades}
            onChange={(e) =>
              setNovoPaciente({
                ...novoPaciente,
                alergiasComorbidades: e.target.value,
              })
            }
          />

          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-medium md:col-span-2"
          >
            Cadastrar Paciente
          </button>
        </form>
      </div>

      {/* Lista de Pacientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Pacientes Cadastrados</h3>
          <div className="flex items-center gap-2 bg-white border px-3 py-1 rounded">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="outline-none text-sm"
            />
          </div>
        </div>

        {loading ? (
          <p className="p-8 text-center text-gray-500">Carregando...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Nome</th>
                <th className="p-4">CPF</th>
                <th className="p-4">Convênio</th>
                <th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pacientes.map((paciente) => (
                <tr key={paciente.id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-500">#{paciente.id}</td>
                  <td className="p-4 font-medium">{paciente.nome}</td>
                  <td className="p-4">{paciente.cpf}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      {paciente.convenio}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:underline">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {pacientes.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    Nenhum paciente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
