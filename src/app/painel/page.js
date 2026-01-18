"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { ChevronRight, AlertCircle } from "lucide-react";

export default function PainelPage() {
  // Estado simples para a senha atual
  const [chamada, setChamada] = useState({
    id: 0,
    senha: "---",
    local: "Aguarde...",
  });

  // Estado para o histórico
  const [historico, setHistorico] = useState([]);

  // Função simples de tocar o som
  function tocarAudio() {
    const audio = new Audio("/notification.mp3");
    audio.play().catch((e) => console.log("Áudio bloqueado pelo navegador"));
  }

  // Efeito único que roda o relógio de atualização
  useEffect(() => {
    const buscarDados = async () => {
      try {
        // O ?t=Date.now() serve para FORÇAR o navegador a não usar cache e buscar dados novos
        const response = await api.get(`/painel/ultima?t=${Date.now()}`);
        const novaChamada = response.data;

        // Se a API não retornou nada ou deu erro, para por aqui
        if (!novaChamada || !novaChamada.id) return;

        // COMPARAÇÃO: Usamos o "setChamada" com função de callback para ter acesso ao valor anterior
        setChamada((chamadaAnterior) => {
          // Se o ID mudou (é uma senha nova)
          if (novaChamada.id !== chamadaAnterior.id) {
            // 1. Toca o som
            tocarAudio();

            // 2. Atualiza o histórico (pega a anterior e joga na lista)
            if (chamadaAnterior.id !== 0) {
              setHistorico((prev) => [chamadaAnterior, ...prev].slice(0, 3));
            }

            // 3. Retorna a nova chamada para atualizar a tela
            return novaChamada;
          }

          // Se for igual, não faz nada (retorna a mesma)
          return chamadaAnterior;
        });
      } catch (error) {
        console.error("Erro ao buscar painel:", error);
      }
    };

    // 1. Chama imediatamente ao abrir
    buscarDados();

    // 2. Repete a cada 3 segundos
    const intervalo = setInterval(buscarDados, 3000);

    // 3. Limpa quando sair da tela
    return () => clearInterval(intervalo);
  }, []); // Array vazio = roda ao montar o componente

  return (
    // Z-50 e FIXED para cobrir a sidebar sem mexer em layout
    <div className="fixed inset-0 z-50 bg-blue-900 text-white flex flex-col items-center justify-between p-10 font-sans">
      {/* Topo */}
      <div className="flex items-center gap-3 opacity-80">
        <AlertCircle className="text-yellow-400" />
        <h1 className="text-3xl font-bold">Painel de Chamadas</h1>
      </div>

      {/* Centro - Senha Gigante */}
      <main className="flex flex-col items-center justify-center w-full flex-1">
        <p className="text-2xl opacity-60 uppercase tracking-widest mb-4">
          Senha Atual
        </p>

        <div className="bg-white text-blue-900 rounded-3xl px-20 py-12 shadow-2xl mb-8 border-b-8 border-blue-800 animate-in zoom-in duration-300">
          <h2 className="text-[10rem] font-black leading-none tracking-tighter">
            {chamada.senha}
          </h2>
        </div>

        <div className="flex items-center gap-4 bg-black/20 px-10 py-4 rounded-full border border-white/10">
          <ChevronRight size={40} className="text-yellow-400" />
          <p className="text-5xl font-bold text-yellow-50">{chamada.local}</p>
        </div>
      </main>

      {/* Rodapé - Histórico */}
      <div className="w-full bg-white/10 rounded-xl p-6 flex items-center justify-between">
        <span className="text-sm font-bold uppercase tracking-widest text-blue-200">
          Últimas Chamadas
        </span>

        <div className="flex gap-10">
          {historico.length === 0 && (
            <span className="opacity-40 italic">Histórico vazio</span>
          )}

          {historico.map((item, i) => (
            <div key={i} className="text-center opacity-70">
              <p className="font-bold text-2xl">{item.senha}</p>
              <p className="text-xs uppercase">{item.local}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
