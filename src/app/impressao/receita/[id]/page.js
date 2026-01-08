"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Printer, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function ImpressaoReceitaPage() {
  const { id } = useParams(); // ID da Consulta
  const router = useRouter();
  const [consulta, setConsulta] = useState(null);

  useEffect(() => {
    // Para buscar a consulta, precisamos do endpoint GET /medico/consulta/{id}
    // Como não criamos um específico, vamos usar o endpoint genérico se tiver,
    // ou podemos buscar pelo histórico do paciente se tivermos o ID.
    // DICA: No seu backend, o endpoint GET /medico/dados-triagem/{id} pega pelo agendamento.
    // Vamos supor que você tenha o objeto consulta.
    // SE NÃO TIVER ENDPOINT GET CONSULTA POR ID:
    // Vamos improvisar usando os dados que temos ou criar rapidinho no backend.

    // --> Vamos criar uma função auxiliar no backend rapidinho abaixo para isso funcionar 100%
    carregarConsulta();
  }, [id]);

  async function carregarConsulta() {
    try {
      // Endpoint que vamos criar no passo 2
      const response = await api.get(`/medico/consulta/${id}`);
      setConsulta(response.data);
    } catch (error) {
      alert("Erro ao carregar documento.");
    }
  }

  if (!consulta)
    return <div className="p-8 text-center">Carregando documento...</div>;

  return (
    <div className="bg-gray-100 min-h-screen p-8 flex flex-col items-center print:bg-white print:p-0">
      {/* Botões de Ação (Somem na impressão) */}
      <div className="w-[210mm] flex justify-between mb-6 print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} /> Voltar
        </button>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 shadow"
        >
          <Printer size={20} /> Imprimir Receita
        </button>
      </div>

      {/* Folha A4 */}
      <div className="bg-white w-[210mm] min-h-[297mm] p-12 shadow-lg print:shadow-none print:w-full text-gray-800 relative">
        {/* Cabeçalho */}
        <header className="border-b-2 border-blue-600 pb-4 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">CentralMed</h1>
            <p className="text-sm text-gray-500">
              Clínica Médica Especializada
            </p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>Rua Juraci dos Santos, 81</p>
            <p>Tel: (83) 3333-4444</p>
          </div>
        </header>

        {/* Informações do Paciente */}
        <section className="mb-8 bg-gray-50 p-4 rounded print:bg-transparent print:p-0 print:border print:border-gray-300">
          <h2 className="text-sm font-bold text-gray-500 uppercase mb-2">
            Paciente
          </h2>
          <div className="flex justify-between">
            <p className="text-xl font-semibold">
              {consulta.agendamento.paciente.nome}
            </p>
            <p className="text-gray-600">
              Data: {new Date(consulta.dataHoraInicio).toLocaleDateString()}
            </p>
          </div>
        </section>

        {/* Conteúdo da Receita */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">
            Receituário Médico
          </h2>
          <div className="whitespace-pre-line text-lg leading-relaxed font-medium">
            {consulta.prescricao}
          </div>
        </section>

        {/* Rodapé / Assinatura */}
        <footer className="absolute bottom-12 left-12 right-12 text-center">
          <div className="border-t border-gray-400 w-2/3 mx-auto pt-2 mb-2"></div>
          <p className="font-bold text-lg">
            {consulta.agendamento.medico.nome}
          </p>
          <p className="text-gray-600">
            {consulta.agendamento.medico.crmRegistro}
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Documento gerado eletronicamente pelo sistema CentralMed.
          </p>
        </footer>
      </div>
    </div>
  );
}
