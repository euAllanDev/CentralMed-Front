"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import {
  Plus,
  Save,
  Truck,
  Building2,
  FileText,
  Mail,
  Tag,
} from "lucide-react";

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState([]);
  const [novoFornecedor, setNovoFornecedor] = useState({
    razaoSocial: "",
    cnpj: "",
    nomeFantasia: "",
    emailContato: "",
  });

  useEffect(() => {
    carregarFornecedores();
  }, []);

  async function carregarFornecedores() {
    try {
      const res = await api.get("/fornecedores");
      setFornecedores(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/fornecedores", novoFornecedor);
      alert("Fornecedor salvo com sucesso!");
      setNovoFornecedor({
        razaoSocial: "",
        cnpj: "",
        nomeFantasia: "",
        emailContato: "",
      });
      carregarFornecedores();
    } catch (err) {
      alert("Erro ao salvar. Verifique se o CNPJ já existe.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* CABEÇALHO */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 text-white">
            <Truck size={28} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Fornecedores
            </h2>
            <p className="text-slate-500">Gerencie seus parceiros e contatos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* FORMULÁRIO */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6 text-slate-700">
              <Plus className="text-blue-600" />
              <h3 className="font-bold text-lg">Novo Cadastro</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                  Razão Social
                </label>
                <div className="relative group">
                  <Building2
                    className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={18}
                  />
                  <input
                    value={novoFornecedor.razaoSocial}
                    onChange={(e) =>
                      setNovoFornecedor({
                        ...novoFornecedor,
                        razaoSocial: e.target.value,
                      })
                    }
                    placeholder="Ex: Empresa Ltda"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                  CNPJ
                </label>
                <div className="relative group">
                  <FileText
                    className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={18}
                  />
                  <input
                    value={novoFornecedor.cnpj}
                    onChange={(e) =>
                      setNovoFornecedor({
                        ...novoFornecedor,
                        cnpj: e.target.value,
                      })
                    }
                    placeholder="00.000.000/0000-00"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                  Nome Fantasia
                </label>
                <div className="relative group">
                  <Tag
                    className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={18}
                  />
                  <input
                    value={novoFornecedor.nomeFantasia}
                    onChange={(e) =>
                      setNovoFornecedor({
                        ...novoFornecedor,
                        nomeFantasia: e.target.value,
                      })
                    }
                    placeholder="Ex: Nome Comercial"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    size={18}
                  />
                  <input
                    value={novoFornecedor.emailContato}
                    onChange={(e) =>
                      setNovoFornecedor({
                        ...novoFornecedor,
                        emailContato: e.target.value,
                      })
                    }
                    placeholder="contato@empresa.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                <Save size={18} /> Salvar Fornecedor
              </button>
            </form>
          </div>

          {/* TABELA */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="p-5 font-semibold uppercase text-xs tracking-wider">
                      Razão Social / Fantasia
                    </th>
                    <th className="p-5 font-semibold uppercase text-xs tracking-wider">
                      CNPJ
                    </th>
                    <th className="p-5 font-semibold uppercase text-xs tracking-wider">
                      Contato
                    </th>
                    <th className="p-5 font-semibold uppercase text-xs tracking-wider text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {fornecedores.map((f) => (
                    <tr
                      key={f.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-5">
                        <div className="font-bold text-slate-800">
                          {f.razaoSocial}
                        </div>
                        <div className="text-xs text-slate-400">
                          {f.nomeFantasia}
                        </div>
                      </td>
                      <td className="p-5 font-mono text-slate-600">{f.cnpj}</td>
                      <td className="p-5 text-slate-600">{f.emailContato}</td>
                      <td className="p-5 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            f.ativo
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-red-50 text-red-700 border-red-100"
                          }`}
                        >
                          {f.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {fornecedores.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-8 text-center text-slate-400 italic"
                      >
                        Nenhum fornecedor cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
