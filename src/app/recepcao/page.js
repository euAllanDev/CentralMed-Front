"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { UserPlus, Calendar, Clock, Users, Search, X, CheckCircle } from "lucide-react";

export default function RecepcaoDashboard() {
  // Estados para o Modal de Atendimento Imediato
  const [modalAberto, setModalAberto] = useState(false);
  const [cpfBusca, setCpfBusca] = useState("");
  const [pacienteEncontrado, setPacienteEncontrado] = useState(null);
  const [loading, setLoading] = useState(false);

  // Função para buscar paciente pelo CPF (Simulação de filtro local ou endpoint de busca)
  async function buscarPaciente() {
    if (!cpfBusca) return;
    setLoading(true);
    try {
      // O ideal seria um endpoint /recepcao/pacientes?cpf=...
      // Como temos o listar todos, vamos filtrar no front por enquanto para simplificar
      const response = await api.get("/recepcao/pacientes");
      const encontrado = response.data.find(p => p.cpf === cpfBusca);
      
      if (encontrado) {
        setPacienteEncontrado(encontrado);
      } else {
        alert("Paciente não encontrado com este CPF.");
        setPacienteEncontrado(null);
      }
    } catch (error) {
      alert("Erro ao buscar paciente.");
    } finally {
      setLoading(false);
    }
  }

  // Função que cria o agendamento "Walk-in"
  async function confirmarAtendimentoImediato() {
    if (!pacienteEncontrado) return;
    
    try {
      const payload = {
        pacienteId: pacienteEncontrado.id,
        medicoId: null // Null = Triagem Geral (sem médico específico)
      };

      const response = await api.post("/recepcao/atendimento-imediato", payload);
      
      alert(`✅ Check-in Realizado!\n\nPaciente: ${pacienteEncontrado.nome}\nSenha: ${response.data.senhaPainel}\nStatus: Fila da Triagem`);
      
      // Limpa e fecha
      setModalAberto(false);
      setPacienteEncontrado(null);
      setCpfBusca("");
    } catch (error) {
      alert("Erro ao realizar atendimento.");
      console.error(error);
    }
  }

  return (
    <div className="space-y-8 relative">
      
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Recepção</h1>
        <p className="text-gray-500">Gestão de fluxo e atendimento</p>
      </div>

      {/* Cards de Ação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/recepcao/pacientes" className="group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="bg-blue-100 p-4 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <UserPlus size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-700">Novo Paciente</h3>
              <p className="text-sm text-gray-400">Cadastrar ficha completa</p>
            </div>
          </div>
        </Link>

        <Link href="/recepcao/agenda" className="group">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all cursor-pointer h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="bg-green-100 p-4 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <Calendar size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-700">Agenda & Check-in</h3>
              <p className="text-sm text-gray-400">Confirmar presença</p>
            </div>
          </div>
        </Link>

        {/* Botão Atendimento Imediato (Abre Modal) */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl shadow-md text-white flex flex-col justify-between h-full">
          <div>
            <div className="bg-white/20 w-fit p-2 rounded mb-3">
              <Clock size={24} />
            </div>
            <h3 className="text-xl font-bold">Chegou Agora?</h3>
            <p className="text-purple-200 text-sm mt-1">
              Atendimento imediato sem agendamento prévio.
            </p>
          </div>
          <button 
            onClick={() => setModalAberto(true)}
            className="bg-white text-purple-700 py-2 px-4 rounded font-bold hover:bg-purple-50 transition-colors w-full mt-4"
          >
            Iniciar Atendimento
          </button>
        </div>
      </div>

      {/* --- MODAL DE ATENDIMENTO IMEDIATO --- */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header Modal */}
            <div className="bg-purple-700 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2">
                <Clock size={20} /> Atendimento Imediato
              </h3>
              <button onClick={() => setModalAberto(false)} className="hover:bg-white/20 p-1 rounded">
                <X size={20} />
              </button>
            </div>

            {/* Corpo Modal */}
            <div className="p-6 space-y-4">
              {!pacienteEncontrado ? (
                <>
                  <p className="text-sm text-gray-600">Busque o paciente pelo CPF para gerar a senha.</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="CPF (Ex: 111.222.333-44)" 
                      className="flex-1 border p-2 rounded focus:outline-purple-500"
                      value={cpfBusca}
                      onChange={(e) => setCpfBusca(e.target.value)}
                    />
                    <button 
                      onClick={buscarPaciente}
                      disabled={loading}
                      className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                      <Search size={20} />
                    </button>
                  </div>
                  <div className="text-center text-xs text-gray-400 mt-2">
                    *Para teste, use o CPF do paciente que você cadastrou (Ex: 111.222.333-44)
                  </div>
                </>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded p-4 text-center space-y-3">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{pacienteEncontrado.nome}</h4>
                    <p className="text-sm text-gray-500">Convênio: {pacienteEncontrado.convenio}</p>
                  </div>
                  <button 
                    onClick={confirmarAtendimentoImediato}
                    className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Confirmar e Gerar Senha
                  </button>
                  <button 
                    onClick={() => setPacienteEncontrado(null)}
                    className="text-xs text-gray-500 underline"
                  >
                    Buscar outro paciente
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