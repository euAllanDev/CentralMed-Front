"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { ShoppingCart, Plus, Send } from "lucide-react";

export default function ComprasPage() {
    const [ordens, setOrdens] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);

    useEffect(() => {
        carregarOrdens();
    }, []);

    async function carregarOrdens() {
        try {
            const res = await api.get('/compras');
            setOrdens(res.data);
        } catch (error) { console.error(error) }
    }

    const fecharEAtualizar = () => {
        setModalAberto(false);
        carregarOrdens();
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Ordens de Compra</h2>
                    <p className="text-sm text-gray-500">Gerencie pedidos para seus fornecedores.</p>
                </div>
                <button onClick={() => setModalAberto(true)} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={16}/> Nova Ordem de Compra
                </button>
            </div>

            <TabelaOrdens ordens={ordens} />

            {modalAberto && <ModalNovaOrdem onClose={fecharEAtualizar} />}
        </div>
    )
}

// --- COMPONENTES DA PÁGINA ---

// Modal para criar uma nova Ordem de Compra
function ModalNovaOrdem({ onClose }) {
    const [fornecedores, setFornecedores] = useState([]);
    const [insumos, setInsumos] = useState([]);

    const [fornecedorId, setFornecedorId] = useState("");
    const [dataEntrega, setDataEntrega] = useState("");
    const [itens, setItens] = useState([{ insumoId: "", quantidade: "", valorUnitario: "" }]);

    useEffect(() => {
        async function carregarDados() {
            try {
                const [resF, resI] = await Promise.all([
                    api.get('/fornecedores'),
                    api.get('/estoque'),
                ]);
                setFornecedores(resF.data);
                setInsumos(resI.data);
            } catch (err) { console.error(err) }
        }
        carregarDados();
    }, []);

    const adicionarItem = () => {
        setItens([...itens, { insumoId: "", quantidade: "", valorUnitario: "" }]);
    }
    
    const handleItemChange = (index, event) => {
        const novosItens = [...itens];
        novosItens[index][event.target.name] = event.target.value;
        setItens(novosItens);
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/compras', {
                fornecedorId,
                dataEntregaPrevista: dataEntrega,
                itens
            });
            alert('Ordem de Compra criada com sucesso!');
            onClose();
        } catch(err) {
            alert('Erro ao criar ordem de compra.');
            console.error(err);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <h3 className="font-bold text-lg">Nova Ordem de Compra</h3>
                    {/* Campos Fornecedor e Data */}
                    <div className="grid grid-cols-2 gap-4">
                        <select value={fornecedorId} onChange={e=>setFornecedorId(e.target.value)} className="border p-2 rounded" required><option value="">Selecione o Fornecedor</option>{fornecedores.map(f => <option key={f.id} value={f.id}>{f.razaoSocial}</option>)}</select>
                        <input type="date" value={dataEntrega} onChange={e=>setDataEntrega(e.target.value)} className="border p-2 rounded" required />
                    </div>
                    {/* Lista de Itens */}
                    <div className="space-y-2">
                        {itens.map((item, index) => (
                            <div key={index} className="grid grid-cols-3 gap-2">
                                <select name="insumoId" value={item.insumoId} onChange={e=>handleItemChange(index,e)} className="border p-1 text-sm"><option value="">Item...</option>{insumos.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}</select>
                                <input name="quantidade" value={item.quantidade} onChange={e=>handleItemChange(index,e)} type="number" placeholder="Qtd" className="border p-1 text-sm"/>
                                <input name="valorUnitario" value={item.valorUnitario} onChange={e=>handleItemChange(index,e)} type="number" placeholder="Valor" step="0.01" className="border p-1 text-sm"/>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={adicionarItem} className="text-xs">+ Adicionar Item</button>
                    {/* Ações */}
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <button type="button" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1"><Send size={14}/> Gerar Ordem</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Tabela que lista as ordens criadas
function TabelaOrdens({ ordens }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-3">ID Ordem</th>
                        <th className="p-3">Fornecedor</th>
                        <th className="p-3">Data Emissão</th>
                        <th className="p-3">Valor Total</th>
                        <th className="p-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {ordens.map(ordem => (
                        <tr key={ordem.id}>
                            <td className="p-3 font-mono">#{ordem.id}</td>
                            <td className="p-3 font-medium">{ordem.fornecedor.razaoSocial}</td>
                            <td className="p-3">{new Date(ordem.dataEmissao).toLocaleDateString()}</td>
                            <td className="p-3">R$ {ordem.valorTotal.toFixed(2)}</td>
                            <td className="p-3">{ordem.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}