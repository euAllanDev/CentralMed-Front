"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Users, UserPlus, Shield, Pencil, Lock, Unlock, AlertCircle } from "lucide-react";

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Controle de Edição
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idEmEdicao, setIdEmEdicao] = useState(null);

  // Estado do Formulário
  const [usuarioForm, setUsuarioForm] = useState({
    nome: "", usuarioLogin: "", senha: "", cargo: "", crmRegistro: "", perfil: "RECEPCAO"
  });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      const response = await api.get("/admin/profissionais");
      setUsuarios(response.data);
    } catch (error) {
      console.error("Erro ao listar. Verifique se você é ADMIN.", error);
    } finally {
      setLoading(false);
    }
  }

  function abrirModalCriacao() {
    setModoEdicao(false);
    setIdEmEdicao(null);
    setUsuarioForm({ nome: "", usuarioLogin: "", senha: "", cargo: "", crmRegistro: "", perfil: "RECEPCAO" });
    setModalAberto(true);
  }

  function abrirModalEdicao(user) {
    setModoEdicao(true);
    setIdEmEdicao(user.id);
    setUsuarioForm({
      nome: user.nome,
      usuarioLogin: user.usuarioLogin,
      senha: "", // Senha vazia para não alterar se não quiser
      cargo: user.cargo,
      crmRegistro: user.crmRegistro || "",
      perfil: user.perfil
    });
    setModalAberto(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (modoEdicao) {
        // PUT
        await api.put(`/admin/profissionais/${idEmEdicao}`, usuarioForm);
        alert("Usuário atualizado com sucesso!");
      } else {
        // POST
        await api.post("/admin/profissionais", usuarioForm);
        alert("Usuário cadastrado com sucesso!");
      }
      setModalAberto(false);
      carregarUsuarios();
    } catch (error) {
      alert("Erro ao salvar. Verifique se o login já existe.");
    }
  }

  async function alternarStatus(id, statusAtual) {
    const acao = statusAtual ? "BLOQUEAR" : "ATIVAR";
    if (!confirm(`Deseja realmente ${acao} este usuário?`)) return;

    try {
      await api.patch(`/admin/profissionais/${id}/status`);
      carregarUsuarios();
    } catch (error) {
      alert("Erro ao alterar status.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="text-blue-600" /> Gestão de Acesso
          </h2>
          <p className="text-gray-500 text-sm">Controle de equipe e permissões</p>
        </div>
        <button 
          onClick={abrirModalCriacao}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus size={20} /> Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">Carregando equipe...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="p-4">Status</th>
                <th className="p-4">Nome</th>
                <th className="p-4">Login</th>
                <th className="p-4">Cargo</th>
                <th className="p-4">Perfil</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((u) => {
                const ativo = u.ativo !== false; // Se null ou true, é ativo
                return (
                  <tr key={u.id} className={`transition-colors ${ativo ? 'hover:bg-blue-50/30' : 'bg-gray-100 opacity-60'}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full block ${ativo ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-xs text-gray-500">{ativo ? "Ativo" : "Inativo"}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-800">{u.nome}</td>
                    <td className="p-4 text-gray-500 font-mono">{u.usuarioLogin}</td>
                    <td className="p-4 text-gray-600">{u.cargo}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${
                        u.perfil === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        u.perfil === 'MEDICO' ? 'bg-green-50 text-green-700 border-green-200' : 
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {u.perfil}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button 
                        onClick={() => abrirModalEdicao(u)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => alternarStatus(u.id, ativo)}
                        className={`p-2 rounded-full transition-colors ${ativo ? 'text-red-500 hover:bg-red-100' : 'text-green-600 hover:bg-green-100'}`}
                        title={ativo ? "Bloquear" : "Ativar"}
                      >
                        {ativo ? <Lock size={18} /> : <Unlock size={18} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Unificado (Criar e Editar) */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className={`p-4 text-white ${modoEdicao ? 'bg-orange-600' : 'bg-blue-600'}`}>
              <h3 className="text-lg font-bold flex items-center gap-2">
                {modoEdicao ? <Pencil size={20} /> : <UserPlus size={20} />}
                {modoEdicao ? "Editar Colaborador" : "Novo Colaborador"}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nome Completo</label>
                <input 
                  type="text" required className="w-full border p-2 rounded focus:outline-blue-500"
                  value={usuarioForm.nome}
                  onChange={e => setUsuarioForm({...usuarioForm, nome: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Login</label>
                  <input 
                    type="text" required className="w-full border p-2 rounded focus:outline-blue-500"
                    value={usuarioForm.usuarioLogin}
                    onChange={e => setUsuarioForm({...usuarioForm, usuarioLogin: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    {modoEdicao ? "Nova Senha (Opcional)" : "Senha"}
                  </label>
                  <input 
                    type="password" 
                    required={!modoEdicao} 
                    placeholder={modoEdicao ? "Deixe vazio para manter" : "***"}
                    className="w-full border p-2 rounded focus:outline-blue-500"
                    value={usuarioForm.senha}
                    onChange={e => setUsuarioForm({...usuarioForm, senha: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Cargo</label>
                  <input 
                    type="text" placeholder="Ex: Médico" required className="w-full border p-2 rounded focus:outline-blue-500"
                    value={usuarioForm.cargo}
                    onChange={e => setUsuarioForm({...usuarioForm, cargo: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Registro</label>
                  <input 
                    type="text" placeholder="CRM/COREN" className="w-full border p-2 rounded focus:outline-blue-500"
                    value={usuarioForm.crmRegistro}
                    onChange={e => setUsuarioForm({...usuarioForm, crmRegistro: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nível de Acesso</label>
                <select 
                  className="w-full border p-2 rounded mt-1 bg-white focus:outline-blue-500"
                  value={usuarioForm.perfil}
                  onChange={e => setUsuarioForm({...usuarioForm, perfil: e.target.value})}
                >
                  <option value="RECEPCAO">Recepção</option>
                  <option value="ENFERMAGEM">Enfermagem</option>
                  <option value="MEDICO">Médico</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button 
                  type="button" 
                  onClick={() => setModalAberto(false)} 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={`text-white px-6 py-2 rounded hover:opacity-90 font-bold shadow-md ${modoEdicao ? 'bg-orange-600' : 'bg-blue-600'}`}
                >
                  {modoEdicao ? "Salvar Alterações" : "Salvar Usuário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}