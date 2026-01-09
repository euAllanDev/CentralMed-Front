"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalIcon, List, Plus } from "lucide-react";

export default function AgendaGeral() {
  const [visualizacao, setVisualizacao] = useState("CALENDARIO"); // 'CALENDARIO' ou 'LISTA'
  const [mesAtual, setMesAtual] = useState(new Date());
  
  // Simulação de dados (backend precisaria enviar: [{ data: '2026-01-15', total: 5 }])
  const diasComConsultas = {
    "2026-01-15": 3,
    "2026-01-20": 10
  };

  // Funções de navegação do mês
  const proximoMes = () => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() + 1)));
  const mesAnterior = () => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() - 1)));

  // Gera dias do mês
  const diasDoMes = () => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1).getDay(); // 0 = Dom
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    
    let dias = [];
    for (let i = 0; i < primeiroDia; i++) dias.push(null); // Espaços vazios
    for (let i = 1; i <= diasNoMes; i++) dias.push(i);
    return dias;
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-full p-2">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Agenda Geral</h2>
            <p className="text-gray-500 text-sm">Gerencie agendamentos futuros</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-lg border shadow-sm">
            <button 
                onClick={() => setVisualizacao("CALENDARIO")}
                className={`p-2 rounded ${visualizacao === "CALENDARIO" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
            >
                <CalIcon size={20} />
            </button>
            <button 
                onClick={() => setVisualizacao("LISTA")}
                className={`p-2 rounded ${visualizacao === "LISTA" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
            >
                <List size={20} />
            </button>
        </div>
      </div>

      {/* Visualização Calendário */}
      {visualizacao === "CALENDARIO" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            {/* Navegação Mês */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={mesAnterior} className="p-2 hover:bg-gray-100 rounded"><ChevronLeft /></button>
                <h3 className="text-xl font-bold text-gray-800 capitalize">
                    {mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={proximoMes} className="p-2 hover:bg-gray-100 rounded"><ChevronRight /></button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => <div key={d} className="text-xs font-bold text-gray-400 uppercase">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {diasDoMes().map((dia, idx) => {
                    if (!dia) return <div key={idx}></div>;
                    
                    // Formata data YYYY-MM-DD para checar se tem evento
                    const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth()+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
                    const qtd = diasComConsultas[dataStr] || 0;

                    return (
                        <div key={idx} className="h-24 border rounded-lg p-2 flex flex-col justify-between hover:border-blue-400 cursor-pointer transition-all bg-gray-50 hover:bg-white group relative">
                            <span className="text-sm font-bold text-gray-700">{dia}</span>
                            
                            {qtd > 0 ? (
                                <span className="bg-blue-100 text-blue-700 text-xs py-1 px-2 rounded font-bold">
                                    {qtd} consultas
                                </span>
                            ) : (
                                <button className="invisible group-hover:visible text-blue-500 text-xs flex justify-center items-center gap-1">
                                    <Plus size={12} /> Agendar
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      {/* Visualização Lista (Texto) */}
      {visualizacao === "LISTA" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-4">Próximos Agendamentos</h3>
            <div className="space-y-4">
                {/* Mock de lista */}
                <div className="flex gap-4 border-l-4 border-blue-500 pl-4 py-2">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase">JAN</p>
                        <p className="text-xl font-bold text-gray-800">15</p>
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">Maria da Silva</p>
                        <p className="text-sm text-gray-500">14:00 - Dr. House (Cardiologista)</p>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}