"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Users, UserPlus, Shield, AlertCircle } from "lucide-react";

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Estado do formulário
  const [novoUser, setNovoUser] = useState({
    nome: "", 
    usuarioLogin: "", 
    senha: "", 
    cargo: "", 
    crmRegistro: "", 
    perfil: "RECEPCAO"
  });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      const response = await api.get("/admin/profissionais");
      setUsuarios(response.data);
    } catch (error) {
      console.error("Erro ao listar usuários", error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarUsuario(e) {
    e.preventDefault();
    try {
      // Usa o endpoint de Auth (Register) pois ele criptografa a senha
      await api.post("/auth/register", novoUser);
      
      alert("Usuário cadastrado com sucesso!");
      setModalAberto(false);
      
      // Limpa formulário
      setNovoUser({ nome: "", usuarioLogin: "", senha: "", cargo: "", crmRegistro: "", perfil: "RECEPCAO" });
      
      // Recarrega lista
      carregarUsuarios();
    } catch (error) {
      alert("Erro ao cadastrar. Verifique se o login já existe.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="text-blue-600" /> Gestão de Acesso
          </h2>
          <p className="text-gray-500 text-sm">Cadastre médicos e funcionários</p>
        </div>
        
        <button 
          onClick={() => setModalAberto(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus size={20} /> Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando equipe...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="p-4 font-semibold">Nome</th>
                <th className="p-4 font-semibold">Login</th>
                <th className="p-4 font-semibold">Cargo</th>
                <th className="p-4 font-semibold">Perfil (Permissão)</th>
                <th className="p-4 font-semibold">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{u.nome}</td>
                  <td className="p-4 text-gray-500">{u.usuarioLogin}</td>
                  <td className="p-4 text-gray-600">{u.cargo}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${
                      u.perfil === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      u.perfil === 'MEDICO' ? 'bg-green-50 text-green-700 border-green-200' : 
                      u.perfil === 'ENFERMAGEM' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {u.perfil}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-mono text-gray-500">
                    {u.crmRegistro || "-"}
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Cadastro */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-blue-600 p-4 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <UserPlus size={20} /> Novo Colaborador
              </h3>
            </div>
            
            <form onSubmit={salvarUsuario} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nome Completo</label>
                <input 
                  type="text" required className="w-full border p-2 rounded focus:outline-blue-500"
                  value={novoUser.nome}
                  onChange={e => setNovoUser({...novoUser, nome: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Login</label>
                  <input 
                    type="text" required className="w-full border p-2 rounded focus:outline-blue-500"
                    value={novoUser.usuarioLogin}
                    onChange={e => setNovoUser({...novoUser, usuarioLogin: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Senha</label>
                  <input 
                    type="password" required className="w-full border p-2 rounded focus:outline-blue-500"
                    value={novoUser.senha}
                    onChange={e => setNovoUser({...novoUser, senha: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Cargo</label>
                  <input 
                    type="text" placeholder="Ex: Médico" required className="w-full border p-2 rounded focus:outline-blue-500"
                    value={novoUser.cargo}
                    onChange={e => setNovoUser({...novoUser, cargo: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Registro</label>
                  <input 
                    type="text" placeholder="CRM/COREN" className="w-full border p-2 rounded focus:outline-blue-500"
                    value={novoUser.crmRegistro}
                    onChange={e => setNovoUser({...novoUser, crmRegistro: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Nível de Acesso</label>
                <select 
                  className="w-full border p-2 rounded mt-1 bg-white focus:outline-blue-500"
                  value={novoUser.perfil}
                  onChange={e => setNovoUser({...novoUser, perfil: e.target.value})}
                >
                  <option value="RECEPCAO">Recepção</option>
                  <option value="ENFERMAGEM">Enfermagem</option>
                  <option value="MEDICO">Médico</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={10} /> Define quais menus o usuário poderá ver.
                </p>
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
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold shadow-lg shadow-blue-200"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}