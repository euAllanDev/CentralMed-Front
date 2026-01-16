"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { DollarSign, FileUp, Filter } from "lucide-react";

export default function FaturamentoLotesPage() {
  const [guiasAbertas, setGuiasAbertas] = useState([]);
  const [guiasSelecionadas, setGuiasSelecionadas] = useState(new Set());
  const [filtroConvenio, setFiltroConvenio] = useState("TODOS");
  const [convenios, setConvenios] = useState([]);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resGuias, resConvenios] = await Promise.all([
          api.get("/faturamento/guias-abertas"),
          api.get("/admin/convenios")
        ]);
        setGuiasAbertas(resGuias.data);
        setConvenios(resConvenios.data);
      } catch (error) { console.error(error) }
    }
    carregarDados();
  }, []);

  // ... (o resto das suas funções `handleSelect`, `faturarSelecionadas`, etc. vem aqui)
  
  return (
    <div className="space-y-6">
      {/* ... (Todo o seu JSX para a tabela de faturamento vem aqui) ... */}
      <h2 className="text-2xl font-bold text-gray-800">Faturamento de Convênios</h2>
      <p>Página em construção...</p>
    </div>
  );
}