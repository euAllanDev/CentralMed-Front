"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { ChevronRight, Activity, MapPin, Clock } from "lucide-react";

export default function PainelPage() {
  const [chamada, setChamada] = useState({
    id: 0,
    senha: "---",
    local: "Aguarde...",
  });

  const [historico, setHistorico] = useState([]);
  const [piscar, setPiscar] = useState(false); // Estado para animação visual

  function tocarAudio() {
    const audio = new Audio("/notification.mp3");
    audio.play().catch((e) => console.log("Áudio bloqueado pelo navegador"));
  }

  // --- LÓGICA PEDIDA: LIMPAR O NOME DO LOCAL ---
  const formatarLocal = (textoOriginal) => {
    if (!textoOriginal) return "---";

    const texto = textoOriginal.toLowerCase();

    // Se tiver "triagem" no nome (ex: "Triagem 01", "Sala Triagem"), vira só "TRIAGEM"
    if (texto.includes("triagem")) return "TRIAGEM";

    // Se tiver "consultorio" no nome (ex: "Consultório 05"), vira só "CONSULTÓRIO"
    if (texto.includes("consultório") || texto.includes("consultorio"))
      return "CONSULTÓRIO";

    // Se for recepção ou guichê (opcional, adicionei por garantia)
    if (texto.includes("recepção") || texto.includes("guichê"))
      return "RECEPÇÃO";

    // Caso não se encaixe, retorna o original (ou mude para retornar vazio)
    return textoOriginal;
  };

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const response = await api.get(`/painel/ultima?t=${Date.now()}`);
        const novaChamada = response.data;

        if (!novaChamada || !novaChamada.id) return;

        setChamada((chamadaAnterior) => {
          if (novaChamada.id !== chamadaAnterior.id) {
            tocarAudio();

            // Ativa efeito visual de piscar
            setPiscar(true);
            setTimeout(() => setPiscar(false), 1000);

            if (chamadaAnterior.id !== 0) {
              setHistorico((prev) => [chamadaAnterior, ...prev].slice(0, 4));
            }
            return novaChamada;
          }
          return chamadaAnterior;
        });
      } catch (error) {
        console.error("Erro ao buscar painel:", error);
      }
    };

    buscarDados();
    const intervalo = setInterval(buscarDados, 3000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    // Fundo com gradiente moderno para dar profundidade
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-between p-6 font-sans overflow-hidden">
      {/* Topo - Cabeçalho mais limpo */}
      <header className="w-full flex items-center justify-between opacity-80 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-wide">
            Painel de Chamadas
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm opacity-60">
          <Clock size={16} />
          <span>Atendimento em tempo real</span>
        </div>
      </header>

      {/* Centro - Destaque Principal */}
      <main className="flex flex-col items-center justify-center w-full flex-1 gap-6">
        {/* Card da Senha */}
        <div
          className={`
            relative flex flex-col items-center justify-center 
            bg-white text-slate-900 rounded-[2.5rem] 
            w-full max-w-4xl py-12 shadow-[0_0_60px_-15px_rgba(59,130,246,0.5)]
            transition-all duration-500
            ${piscar ? "scale-105 ring-8 ring-yellow-400" : "scale-100"}
          `}
        >
          <span className="absolute top-8 text-xl font-bold text-slate-400 uppercase tracking-[0.3em]">
            Senha Atual
          </span>

          <h2 className="text-[12rem] md:text-[14rem] font-black leading-none tracking-tighter text-blue-950 mt-4">
            {chamada.senha}
          </h2>
        </div>

        {/* Localização - Agora usando a formatação limpa */}
        <div className="flex items-center gap-4 bg-black/30 backdrop-blur-md px-12 py-6 rounded-full border border-white/10 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
          <MapPin className="text-yellow-400 w-10 h-10" />
          <p className="text-5xl md:text-6xl font-bold text-white uppercase tracking-tight">
            {formatarLocal(chamada.local)}
          </p>
        </div>
      </main>

      {/* Rodapé - Histórico Estilizado */}
      <div className="w-full bg-white/5 backdrop-blur-sm border-t border-white/10 rounded-t-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-blue-300">
          <ChevronRight />
          <span className="text-sm font-bold uppercase tracking-widest">
            Últimas Chamadas
          </span>
        </div>

        <div className="flex gap-4 md:gap-12 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto justify-center">
          {historico.length === 0 && (
            <span className="opacity-30 text-sm italic">
              Nenhum histórico recente
            </span>
          )}

          {historico.map((item, i) => (
            <div key={i} className="flex flex-col items-center group">
              <span className="font-bold text-3xl opacity-80 group-hover:opacity-100 group-hover:text-yellow-300 transition-colors">
                {item.senha}
              </span>
              <span className="text-[10px] md:text-xs uppercase opacity-50 font-medium tracking-wider">
                {formatarLocal(item.local)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
