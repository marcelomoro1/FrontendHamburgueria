// src/components/ProdutoFormulario.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../service/api';
import { AxiosError } from 'axios'; // Importar AxiosError para tipagem mais precisa
import type { Produto } from '../model/Produto';
import { Categoria } from '../model/Produto';

interface ProdutoFormularioProps {
    onClose: () => void;
}

export function ProdutoFormulario({ onClose }: ProdutoFormularioProps) {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<Omit<Produto, 'id'>>({
        nome: '',
        descricao: '',
        preco: 0,
        imagem: '',
        categoria: Categoria.LANCHE,
        disponibilidade: true,
    });

    const mutation = useMutation({
        mutationFn: async (novoProduto: Omit<Produto, 'id'>) => {
            const response = await api.post('/produtos', novoProduto);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['produtos'] });
            alert('Produto cadastrado com sucesso!');
            onClose();
        },
        // CORREÇÃO AQUI: Tratamento de erro mais robusto
        onError: (error: unknown) => { // Tipar como 'unknown' é a prática recomendada para 'catch' blocks
            console.error("Erro ao cadastrar produto:", error);

            let errorMessage = "Erro desconhecido ao cadastrar produto.";

            if (error instanceof AxiosError) {
                // Se for um erro do Axios, tentamos obter a mensagem da resposta do backend.
                // Verificamos se 'error.response' existe, 'error.response.data' existe
                // e se 'error.response.data' é um objeto com a propriedade 'message'.
                if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
                    errorMessage = (error.response.data as { message: string }).message;
                } else {
                    // Caso contrário, usamos a mensagem padrão do AxiosError
                    errorMessage = error.message;
                }
            } else if (error instanceof Error) {
                // Se for um erro JavaScript padrão, usamos sua mensagem
                errorMessage = error.message;
            }

            alert('Erro ao cadastrar produto: ' + errorMessage);
        },
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        // CORREÇÃO AQUI: Removida a variável 'type' que não era usada.
        // Acesso a 'checked' é feito diretamente no case 'disponibilidade'.
        const { name, value } = e.target;

        setFormData((prev) => {
            switch (name) {
                case 'nome':
                case 'descricao':
                case 'imagem':
                    return { ...prev, [name]: value };
                case 'preco':
                    return { ...prev, preco: parseFloat(value) || 0 };
                case 'categoria':
                    return { ...prev, categoria: value as Categoria };
                case 'disponibilidade':
                    // Acesso seguro a 'checked' via type assertion, pois sabemos que 'disponibilidade' é um checkbox.
                    return { ...prev, disponibilidade: (e.target as HTMLInputElement).checked };
                default:
                    return prev;
            }
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const dataToSend = {
            ...formData,
            preco: parseFloat(String(formData.preco))
        };
        mutation.mutate(dataToSend);
    }

    return (
        <form className="formProduto" onSubmit={handleSubmit} style={{ margin: '20px' }}>
            <h2>Cadastrar Novo Produto</h2>

            <label>Nome:</label>
            <input name="nome" placeholder="Nome" value={formData.nome}
                   onChange={handleChange} required/>

            <label>Descrição:</label>
            <input name="descricao" placeholder="Descrição" value={formData.descricao}
                   onChange={handleChange} required/>

            <label>Link Imagem:</label>
            <input name="imagem" placeholder="URL da Imagem" value={formData.imagem}
                   onChange={handleChange} required/>

            <label>Categoria:</label>
            <select name="categoria" value={formData.categoria} onChange={handleChange} required>
                {Object.values(Categoria).map((cat) => (
                    <option key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                    </option>
                ))}
            </select>

            <label>Preço:</label>
            <input name="preco" type="number" step="0.01" placeholder="Preço" value={formData.preco}
                   onChange={handleChange} required/>

            <label>Disponibilidade:</label>
            <input
                type="checkbox"
                name="disponibilidade"
                checked={formData.disponibilidade}
                onChange={handleChange}
            />
            <br />

            <button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
            </button>
        </form>
    );
}