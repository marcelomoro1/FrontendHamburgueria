// src/components/ProdutoLista.tsx
import { useEffect, useState, useCallback } from 'react';
import { useQuery } from "@tanstack/react-query";
import { api } from '../service/api.ts';
import type { Produto } from "../model/Produto";
import "../components/ProdutoLista.css";
import { useAuth } from '../contexts/AuthContext.tsx';
import { CarrinhoModal } from './CarrinhoModal.tsx';
import { useNavigate } from 'react-router-dom';
import type { CarrinhoFront } from '../types/CarrinhoTypes.ts';
import axios from 'axios';

export function ProdutoLista() {
    const { isAuthenticated, loadingAuth } = useAuth();
    const [carrinho, setCarrinho] = useState<CarrinhoFront | null>(null);
    const [isCarrinhoModalOpen, setIsCarrinhoModalOpen] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const navigate = useNavigate();

    // UseQuery para buscar produtos
    const { data: produtos, isLoading, isError } = useQuery<Produto[]>({
        queryKey: ['produtos'],
        queryFn: async () => {
            const response = await api.get('/produtos');
            return response.data;
        }
    });

    // Função auxiliar para exibir mensagens temporárias
    const showMessage = (text: string, type: 'success' | 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    // Função para buscar o carrinho do backend, memorizada com useCallback
    const fetchCarrinho = useCallback(async () => {
        if (!isAuthenticated) {
            setCarrinho(null); // Limpa o carrinho se não estiver autenticado
            setIsCarrinhoModalOpen(false); // Fecha o modal se o usuário não está autenticado
            return;
        }
        try {
            const response = await api.get<CarrinhoFront>('/carrinho/meu');
            setCarrinho(response.data);
            console.log("Carrinho carregado:", response.data);
            // Se o carrinho estiver vazio após carregar e o modal estiver aberto, feche-o e avise
            if (response.data.itens.length === 0 && isCarrinhoModalOpen) {
                showMessage("Seu carrinho ficou vazio.", 'error');
                setIsCarrinhoModalOpen(false);
            }
        } catch (error) {
            console.error("Erro ao carregar carrinho:", error);
            setCarrinho(null); // Define o carrinho como null em caso de erro
            if (isCarrinhoModalOpen) {
                showMessage("Não foi possível carregar seu carrinho.", 'error');
                setIsCarrinhoModalOpen(false);
            }
        }
    }, [isAuthenticated, isCarrinhoModalOpen]); // 'isCarrinhoModalOpen' é uma dependência porque afeta o comportamento dentro da função

    // Efeito para carregar o carrinho quando a autenticação e o carregamento terminam
    useEffect(() => {
        if (!loadingAuth) {
            fetchCarrinho();
        }
    }, [isAuthenticated, loadingAuth, fetchCarrinho]); // 'fetchCarrinho' é uma dependência do useCallback

    const handleAdicionarAoCarrinho = async (produtoId: number, nomeProduto: string) => {
        if (!isAuthenticated) {
            showMessage("Você precisa estar logado para adicionar produtos ao carrinho!", 'error');
            return;
        }
        try {
            const response = await api.post<CarrinhoFront>('/carrinho/adicionar', {
                produtoId: produtoId,
                quantidade: 1
            });
            // Atualiza o estado do carrinho com a resposta do backend
            setCarrinho(response.data);
            showMessage(`${nomeProduto} adicionado ao carrinho!`, 'success');
        } catch (error: unknown) {
            console.error("Erro ao adicionar ao carrinho:", error);
            let errorMessage = `Erro ao adicionar ${nomeProduto} ao carrinho.`;
            if (axios.isAxiosError(error)) {
                errorMessage = (error.response?.data as { message?: string })?.message || errorMessage;
            }
            showMessage(errorMessage, 'error');
        }
    };

    const handleAtualizarQuantidade = async (itemId: number, novaQuantidade: number) => {
        if (!isAuthenticated) return;

        // Se a nova quantidade for 0 ou menor, trate como remoção
        if (novaQuantidade <= 0) {
            await handleRemoverItem(itemId);
            return;
        }

        try {
            const response = await api.put<CarrinhoFront>(`/carrinho/atualizar/${itemId}`, {
                quantidade: novaQuantidade
            });
            // Atualiza o estado do carrinho com a resposta do backend
            setCarrinho(response.data);
            showMessage("Quantidade atualizada no carrinho!", 'success');
            // Se o carrinho ficar vazio após a atualização, feche o modal e avise
            if (response.data.itens.length === 0) {
                setIsCarrinhoModalOpen(false);
                showMessage("Seu carrinho ficou vazio após a atualização.", 'error');
            }
        } catch (error: unknown) {
            console.error("Erro ao atualizar quantidade:", error);
            let errorMessage = "Erro ao atualizar quantidade no carrinho.";
            if (axios.isAxiosError(error)) {
                errorMessage = (error.response?.data as { message?: string })?.message || errorMessage;
            }
            showMessage(errorMessage, 'error');
        }
    };

    const handleRemoverItem = async (itemId: number) => {
        if (!isAuthenticated) return;
        try {
            // Apenas executa a requisição DELETE. O corpo da resposta pode ser vazio (204 No Content).
            await api.delete(`/carrinho/remover/${itemId}`);

            // Após a remoção, force uma nova busca do carrinho para garantir que o estado local esteja sincronizado
            await fetchCarrinho();

            showMessage("Item removido do carrinho!", 'success');

            // A lógica de fechar o modal e mostrar mensagem de carrinho vazio
            // já está em `fetchCarrinho` ou será refletida na próxima renderização
            // após `setCarrinho` ser chamado por `fetchCarrinho`.
            // Não precisamos mais do `if (response.data.itens.length === 0)` aqui diretamente.

        } catch (error: unknown) {
            console.error("Erro ao remover item:", error);
            let errorMessage = "Erro ao remover item do carrinho.";
            if (axios.isAxiosError(error)) {
                errorMessage = (error.response?.data as { message?: string })?.message || errorMessage;
            }
            showMessage(errorMessage, 'error');
        }
    };

    const handleFinalizarCompra = () => {
        // Verifica se o carrinho existe e se tem itens antes de navegar
        if (!carrinho || carrinho.itens.length === 0) {
            showMessage("Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.", 'error');
            return;
        }
        setIsCarrinhoModalOpen(false); // Fecha o modal antes de navegar
        navigate('/checkout');
    };

    if (isLoading) {
        return <p>Carregando produtos...</p>;
    }
    if (isError) {
        return <p>Erro ao carregar os produtos</p>;
    }

    return (
        <div>

            {message && (
                <div className={`message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
                    {message.text}
                </div>
            )}

            {isAuthenticated && (
                <div className="carrinho-summary">
                    <button className="view-cart-button" onClick={() => setIsCarrinhoModalOpen(true)}>
                        Ver meu Carrinho ({carrinho?.itens?.length || 0}) - Total: R$ {carrinho?.valorTotal ? carrinho.valorTotal.toFixed(2).replace('.', ',') : '0,00'}
                    </button>
                    {/* Botão "Finalizar Compra" só aparece se houver itens no carrinho */}
                    {carrinho && carrinho.itens.length > 0 && (
                        <button className="checkout-button" onClick={handleFinalizarCompra}>
                            Finalizar Compra
                        </button>
                    )}
                </div>
            )}

            {/* Grid de produtos */}
            <div className="produtos-grid">
                {produtos?.filter(p => p.disponibilidade).map((produto) => (
                    <div key={produto.id} className="produto-card">
                        <h2>{produto.nome}</h2>
                        <img src={produto.imagem} alt={produto.nome} className="produto-card-image" />
                        <p className="produto-card-description">{produto.descricao}</p>
                        <p className="produto-card-category">Categoria: {produto.categoria.replace(/_/g, ' ')}</p>
                        <p className="produto-card-price">Preço: R${produto.preco ? produto.preco.toFixed(2).replace('.', ',') : '0,00'}</p>
                        {produto.disponibilidade && isAuthenticated ? (
                            <button
                                className="add-to-cart-button"
                                onClick={() => handleAdicionarAoCarrinho(produto.id, produto.nome)}
                            >
                                Adicionar ao Carrinho
                            </button>
                        ) : (
                            !isAuthenticated && <p className="login-to-add">Faça login para adicionar ao carrinho</p>
                        )}
                        {!produto.disponibilidade && <p className="unavailable-text">Indisponível</p>}
                    </div>
                ))}
            </div>

            {/* O CarrinhoModal */}
            <CarrinhoModal
                isOpen={isCarrinhoModalOpen}
                onClose={() => setIsCarrinhoModalOpen(false)}
                carrinho={carrinho}
                onUpdateQuantity={handleAtualizarQuantidade}
                onRemoveItem={handleRemoverItem}
                onFinalizePurchase={handleFinalizarCompra}
            />
        </div>
    );
}