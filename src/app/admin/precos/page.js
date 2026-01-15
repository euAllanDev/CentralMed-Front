"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";

export default function TabelaPrecosPage() {
    const [convenios, setConvenios] = useState([]);
    const [procedimentos, setProcedimentos] = useState([]);
    
    // Estados do formulário
    const [convenioId, setConvenioId] = useState("");
    const [procedimentoId, setProcedimentoId] = useState("");
    const [valor, setValor] = useState("");

    useEffect(() => {
        // Carrega as listas de Convênios e Procedimentos para os <select>
        async function fetchData() {
            const [resConv, resProc] = await Promise.all([
                api.get('/admin/convenios'),
                api.get('/admin/procedimentos')
            ]);
            setConvenios(resConv.data);
            setProcedimentos(resProc.data);
        }
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            convenio: { id: convenioId },
            procedimento: { id: procedimentoId },
            valor: valor
        };
        try {
            await api.post("/admin/tabela-precos", payload);
            alert("Preço definido com sucesso!");
            // (Lógica para recarregar e mostrar tabela de preços)
        } catch (err) {
            alert("Erro ao definir preço.");
        }
    };
    
    return (
        <div>
            <h2>Tabela de Preços por Convênio</h2>
            
            <form onSubmit={handleSubmit}>
                <select onChange={e => setConvenioId(e.target.value)} required>
                    <option value="">Selecione o Convênio</option>
                    {convenios.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>

                <select onChange={e => setProcedimentoId(e.target.value)} required>
                    <option value="">Selecione o Procedimento</option>
                    {procedimentos.map(p => <option key={p.id} value={p.id}>{p.descricao}</option>)}
                </select>

                <input type="number" step="0.01" placeholder="Valor (R$)" onChange={e => setValor(e.target.value)} required />
                <button type="submit">Salvar Preço</button>
            </form>

            {/* Aqui entraria a tabela com os preços já definidos para o convênio selecionado */}
        </div>
    );
}