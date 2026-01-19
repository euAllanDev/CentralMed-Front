"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { Plus, Save, Truck } from "lucide-react";

export default function FornecedoresPage() {
    const [fornecedores, setFornecedores] = useState([]);
    const [novoFornecedor, setNovoFornecedor] = useState({ razaoSocial: "", cnpj: "", nomeFantasia: "", emailContato: ""});

    useEffect(() => {
        carregarFornecedores();
    }, []);

    async function carregarFornecedores() {
        try {
            const res = await api.get('/fornecedores');
            setFornecedores(res.data);
        } catch(err) {
            console.error(err);
        }
    }
    
    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await api.post('/fornecedores', novoFornecedor);
            alert("Fornecedor salvo com sucesso!");
            setNovoFornecedor({ razaoSocial: "", cnpj: "", nomeFantasia: "", emailContato: ""});
            carregarFornecedores();
        } catch(err) {
            alert("Erro ao salvar. Verifique se o CNPJ já existe.");
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Gestão de Fornecedores</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* FORMULÁRIO */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="font-bold flex items-center gap-2"><Plus/> Novo Fornecedor</h3>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <input value={novoFornecedor.razaoSocial} onChange={e=>setNovoFornecedor({...novoFornecedor, razaoSocial: e.target.value})} placeholder="Razão Social" className="w-full border p-2 rounded"/>
                        <input value={novoFornecedor.cnpj} onChange={e=>setNovoFornecedor({...novoFornecedor, cnpj: e.target.value})} placeholder="CNPJ" className="w-full border p-2 rounded"/>
                        <input value={novoFornecedor.nomeFantasia} onChange={e=>setNovoFornecedor({...novoFornecedor, nomeFantasia: e.target.value})} placeholder="Nome Fantasia" className="w-full border p-2 rounded"/>
                        <input value={novoFornecedor.emailContato} onChange={e=>setNovoFornecedor({...novoFornecedor, emailContato: e.target.value})} placeholder="Email de Contato" className="w-full border p-2 rounded"/>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold p-2 rounded flex items-center justify-center gap-2"><Save size={16}/> Salvar</button>
                    </form>
                </div>

                {/* TABELA */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4">Razão Social</th>
                                <th className="p-4">CNPJ</th>
                                <th className="p-4">Contato</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                        {fornecedores.map(f => (
                            <tr key={f.id}>
                                <td className="p-4 font-bold">{f.razaoSocial}</td>
                                <td className="p-4 font-mono">{f.cnpj}</td>
                                <td className="p-4">{f.emailContato}</td>
                                <td className="p-4">{f.ativo ? "Ativo" : "Inativo"}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}