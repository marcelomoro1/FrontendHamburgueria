// src/components/GerenciarPedidos.tsx
import { useEffect, useState } from 'react';
import axios from 'axios'; // Importe axios (não AxiosError diretamente, pois api já é axios instance)
import { api } from '../service/api';
import './GerenciarPedidos.css'; // Importe o novo arquivo CSS
import type { StatusPedido } from '../types/CarrinhoTypes.ts'; // Importe o enum StatusPedido

// Interface para ItemPedido (corresponde a ItemPedidoResponseDTO do backend)
interface ItemPedido {
    id: number;
    produtoId: number;
    nomeProduto: string;
    imagemProduto: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
}

// Interface para Pedido (corresponde a PedidoResponseDTO do backend)
interface Pedido {
    id: number;
    userId: number;
    userName: string;
    dataPedido: string; // Ou Date, se você for converter
    status: StatusPedido; // Use o enum importado
    valorTotal: number;
    itens: ItemPedido[];
}

export function GerenciarPedidos() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Função para buscar os pedidos do backend
    const fetchPedidos = async () => {
        setLoading(true);
        setError(null);
        try {
            // A rota para ADMIN buscar todos os pedidos é /api/pedidos (GET)
            const response = await api.get<Pedido[]>('/pedidos');
            setPedidos(response.data);
        } catch (err: unknown) { // 'err' é de tipo 'unknown' por padrão
            console.error("Erro ao carregar pedidos:", err);
            let errorMessage = "Ocorreu um erro inesperado ao carregar pedidos.";
            if (axios.isAxiosError(err)) {
                // Se for um erro do Axios, tentamos pegar a mensagem do backend
                errorMessage = (err.response?.data as { message?: string })?.message || err.message;
                if (err.response?.status === 403) {
                    errorMessage = "Você não tem permissão para visualizar estes pedidos.";
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedidos();
    }, []);

    // Função para atualizar o status de um pedido
    const handleUpdateStatus = async (pedidoId: number, newStatus: StatusPedido) => {
        setMessage(null); // Limpa mensagens anteriores
        try {
            // A rota para atualizar o status de um pedido é /api/pedidos/admin/{id}/status
            // e espera um @RequestParam 'newStatus'
            const response = await api.put<Pedido>(`/pedidos/admin/${pedidoId}/status`, null, {
                params: { newStatus: newStatus } // Passa o status como parâmetro de query
            });

            // Atualiza o pedido na lista localmente
            setPedidos(prevPedidos =>
                prevPedidos.map(pedido =>
                    pedido.id === pedidoId ? response.data : pedido
                )
            );
            setMessage({ text: `Status do pedido #${pedidoId} atualizado para ${newStatus}!`, type: 'success' });
        } catch (err: unknown) {
            console.error("Erro ao atualizar status do pedido:", err);
            let errorMessage = `Erro ao atualizar o status do pedido #${pedidoId}.`;
            if (axios.isAxiosError(err)) {
                errorMessage = (err.response?.data as { message?: string })?.message || err.message;
            }
            setMessage({ text: errorMessage, type: 'error' });
        } finally {
            setTimeout(() => setMessage(null), 3000); // Limpa a mensagem após 3 segundos
        }
    };

    if (loading) return <div className="gerenciar-pedidos-container">Carregando pedidos...</div>;
    if (error) return <div className="gerenciar-pedidos-container error-message">{error}</div>;

    return (
        <div className="gerenciar-pedidos-container">
            <h2>Gerenciamento de Pedidos</h2>

            {message && (
                <div className={`message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
                    {message.text}
                </div>
            )}

            {pedidos.length > 0 ? (
                <ul className="pedidos-list">
                    {pedidos.map((pedido) => (
                        <li key={pedido.id} className="pedido-item">
                            <div className="pedido-info">
                                <h3>Pedido #{pedido.id}</h3>
                                <p>Cliente: <strong>{pedido.userName}</strong> (ID: {pedido.userId})</p>
                                <p>Data: {new Date(pedido.dataPedido).toLocaleDateString()} {new Date(pedido.dataPedido).toLocaleTimeString()}</p>
                                <p>Valor Total: R$ {pedido.valorTotal.toFixed(2).replace('.', ',')}</p>
                                <p>Status: <strong className={`status-${pedido.status.toLowerCase()}`}>{pedido.status.replace(/_/g, ' ')}</strong></p>
                                <div className="pedido-itens-list">
                                    <h4>Itens:</h4>
                                    <ul>
                                        {pedido.itens.map(item => (
                                            <li key={item.id}>
                                                {item.nomeProduto} (x{item.quantidade}) - R$ {item.subtotal.toFixed(2).replace('.', ',')}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="pedido-actions">
                                {pedido.status === 'PENDENTE' && (
                                    <>
                                        <button
                                            className="action-button finalize-button"
                                            onClick={() => handleUpdateStatus(pedido.id, 'FINALIZADO')}
                                        >
                                            Marcar como Finalizado
                                        </button>
                                        <button
                                            className="action-button cancel-button"
                                            onClick={() => handleUpdateStatus(pedido.id, 'CANCELADO')}
                                        >
                                            Cancelar Pedido
                                        </button>
                                    </>
                                )}
                                {/* Se o pedido já estiver finalizado ou cancelado, pode desabilitar ou mudar os botões */}
                                {pedido.status === 'FINALIZADO' && (
                                    <span className="status-indicator completed">Concluído</span>
                                )}
                                {pedido.status === 'CANCELADO' && (
                                    <span className="status-indicator cancelled">Cancelado</span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nenhum pedido encontrado.</p>
            )}
        </div>
    );
}