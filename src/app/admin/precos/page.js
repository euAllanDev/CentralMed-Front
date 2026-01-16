"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { DollarSign, Save } from "lucide-react";

export default function TabelaPrecosPage() {
    const [convenios, setConvenios] = useState([]);
    const [procedimentos, setProcedimentos] = useState([]);
    const [tabelaPrecos, setTabelaPrecos] = useState([]);

    // Estado do formulário
    const [form, setForm] = useState({
        convenio: { id: "" },
        procedimento: { id: "" },
        valor: ""
    });

    useEffect(() => {
        carregarDados();
    }, []);

    async function carregarDados() {
        try {
            const [resConvenios, resProcs, resPrecos] = await Promise.all([
                api.get('/admin/convenios'),
                api.get('/admin/procedimentos'),
                api.get('/admin/precos')
            ]);
            setConvenios(resConvenios.data);
            setProcedimentos(resProcs.data);
            setTabelaPrecos(resPrecos.data);
        } catch(e) {
            console.error(e);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await api.post("/admin/precos", form);
            alert("Preço salvo com sucesso!");
            setForm({ convenio: { id: "" }, procedimento: { id: "" }, valor: "" });
            carregarDados();
        } catch(e) {
            alert("Erro ao salvar preço.");
        }
    }
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Tabela de Preços (Faturamento TISS)</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="font-bold text-blue-600 mb-4">Definir Novo Preço</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase">Convênio</label>
                            <select
                                className="w-full mt-1 border p-2 rounded bg-white"
                                value={form.convenio.id}
                                onChange={e => setForm({...form, convenio: { id: e.target.value }})}
                                required
                            >
                                <option value="">Selecione...</option>
                                {convenios.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase">Procedimento</label>
                            <select
                                className="w-full mt-1 border p-2 rounded bg-white"
                                value={form.procedimento.id}
                                onChange={e => setForm({...form, procedimento: { id: e.target.value }})}
                                required
                            >
                                <option value="">Selecione...</option>
                                {procedimentos.map(p => <option key={p.id} value={p.id}>{p.descricao} ({p.codigoTuss})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase">Valor (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="100.00"
                                className="w-full mt-1 border p-2 rounded"
                                value={form.valor}
                                onChange={e => setForm({...form, valor: e.target.value})}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700">
                           <Save size={16} className="inline-block mr-2"/> Salvar
                        </button>
                    </form>
                </div>
                
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 uppercase text-xs">
                            <tr>
                                <th className="p-4">Convênio</th>
                                <th className="p-4">Procedimento</th>
                                <th className="p-4">Código TUSS</th>
                                <th className="p-4 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {tabelaPrecos.map(p => (
                                <tr key={p.id}>
                                    <td className="p-4 font-bold">{p.convenio.nome}</td>
                                    <td className="p-4">{p.procedimento.descricao}</td>
                                    <td className="p-4 font-mono">{p.procedimento.codigoTuss}</td>
                                    <td className="p-4 text-right font-mono">R$ {p.valor.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}