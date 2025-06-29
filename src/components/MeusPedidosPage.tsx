import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { api } from '../service/api';
import { useAuth } from '../contexts/AuthContext';
import './MeusPedidosPage.css';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom'; // <-- Importar useNavigate

// --- Interfaces e Tipos ---

type StatusPedido = 'PENDENTE' | 'PREPARANDO' | 'CONCLUIDO' | 'CANCELADO';

interface ItemPedido {
    id: number;
    produtoNome: string;
    quantidade: number;
    precoUnitario: number;
    precoTotal: number;
}

interface Pedido {
    id: number;
    dataPedido: string;
    status: StatusPedido;
    valorTotal: number;
    itens: ItemPedido[];
    userId?: number;
}

// --- Componente MeusPedidosPage ---

export function MeusPedidosPage() {
    const { isAuthenticated, loadingAuth } = useAuth();
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate(); // <-- Inicializar useNavigate

    useEffect(() => {
        const fetchMeusPedidos = async () => {
            if (loadingAuth || !isAuthenticated) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await api.get<Pedido[]>(`/pedidos/meus`);
                setPedidos(response.data);
                setError(null);
            } catch (err) {
                console.error("Erro ao carregar meus pedidos:", err);
                if (err instanceof AxiosError) {
                    setError(err.response?.data?.message || err.message || "Erro de rede ao carregar pedidos.");
                } else {
                    setError("Ocorreu um erro inesperado ao carregar seus pedidos.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMeusPedidos();
    }, [isAuthenticated, loadingAuth]);

    if (loadingAuth || loading) {
        return (
            <div className="meus-pedidos-container">
                <h2>Meus Pedidos</h2>
                <p>Carregando seus pedidos...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="meus-pedidos-container">
                <h2>Meus Pedidos</h2>
                <p>Por favor, faça login para visualizar seus pedidos.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="meus-pedidos-container">
                <h2>Meus Pedidos</h2>
                <div className="error-message">{error}</div>
                <p>Não foi possível carregar seus pedidos. Tente novamente mais tarde.</p>
            </div>
        );
    }

    return (
        <div className="meus-pedidos-container">
            <button
                onClick={() => navigate('/')} //
                className="back-button2" //
            >
                Voltar
            </button>
            <div className="meus-pedidos-header-with-button">

                <h2>Meus Pedidos</h2>

            </div>

            {pedidos.length === 0 ? (
                <p>Você ainda não fez nenhum pedido.</p>
            ) : (
                <div className="pedidos-list">
                    {pedidos.map((pedido) => (
                        <div key={pedido.id} className="pedido-card">
                            <div className="pedido-header">
                                <h3>Pedido #{pedido.id}</h3>
                                <span className={`status ${pedido.status.toLowerCase()}`}>
                                    {pedido.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <p>
                                <strong>Data:</strong>{' '}
                                {(() => {
                                    if (pedido.dataPedido) {
                                        try {
                                            const dateObject = new Date(pedido.dataPedido);
                                            if (isNaN(dateObject.getTime())) {
                                                return 'Data Inválida (formato inesperado)';
                                            }
                                            return format(dateObject, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
                                        } catch (e) {
                                            console.error('Erro ao tentar criar objeto Date:', e);
                                            return 'Erro de formatação de data';
                                        }
                                    }
                                    return 'Data indisponível ou nula';
                                })()}
                            </p>
                            <p><strong>Total:</strong> R$ {pedido.valorTotal.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}