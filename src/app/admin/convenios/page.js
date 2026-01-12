"use client";


import { useState } from 'react'; 
import ConveniosTab from "../../../components/ConveniosTab";
import ProcedimentosTab from "../../../components/ProcedimentosTab";
import { Building, Tag } from "lucide-react";

export default function FaturamentoPage() {
  const [abaAtiva, setAbaAtiva] = useState("CONVENIOS");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Parâmetros de Faturamento (TISS)</h2>
          <p className="text-gray-500 text-sm">Configure os convênios e procedimentos aceitos pela clínica.</p>
        </div>
      </div>
      
      {/* NAVEGAÇÃO DAS ABAS */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 -mb-px">
          <button
            onClick={() => setAbaAtiva("CONVENIOS")}
            className={`py-4 px-1 inline-flex items-center gap-2 text-sm font-medium border-b-2 transition-all ${
              abaAtiva === "CONVENIOS" 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building size={16} /> Convênios
          </button>
          <button
            onClick={() => setAbaAtiva("PROCEDIMENTOS")}
            className={`py-4 px-1 inline-flex items-center gap-2 text-sm font-medium border-b-2 transition-all ${
              abaAtiva === "PROCEDIMENTOS" 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Tag size={16} /> Procedimentos (TUSS)
          </button>
        </nav>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL */}
      <div>
        {abaAtiva === "CONVENIOS" && <ConveniosTab />}
        {abaAtiva === "PROCEDIMENTOS" && <ProcedimentosTab />}
      </div>
    </div>
  );
}