// src/components/CheckoutPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../service/api.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import type { CarrinhoFront } from '../types/CarrinhoTypes.ts';
import axios from 'axios';
import './CheckoutPage.css'; // Mantenha o CSS

export function CheckoutPage() {
    const { isAuthenticated, loadingAuth } = useAuth();
    const navigate = useNavigate();
    const [carrinho, setCarrinho] = useState<CarrinhoFront | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentOption, setPaymentOption] = useState<'vista' | 'parcelado'>('vista');
    const [installments, setInstallments] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const maxInstallments = 12;

    useEffect(() => {
        const fetchCarrinhoForCheckout = async () => {
            if (!isAuthenticated) {
                navigate('/login');
                return;
            }
            try {
                const response = await api.get<CarrinhoFront>('/carrinho/meu');
                if (response.data.itens.length === 0) {
                    setError("Seu carrinho está vazio. Adicione produtos para finalizar a compra.");
                    setTimeout(() => navigate('/'), 3000); // Volta para o menu
                    return;
                }
                setCarrinho(response.data);
            } catch (err) {
                console.error("Erro ao carregar carrinho para checkout:", err);
                let errorMessage = "Não foi possível carregar seu carrinho. Tente novamente.";
                if (axios.isAxiosError(err)) {
                    errorMessage = (err.response?.data as { message?: string })?.message || errorMessage;
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (!loadingAuth) {
            fetchCarrinhoForCheckout();
        }
    }, [isAuthenticated, loadingAuth, navigate]);

    const handleFinalizarPedido = async () => {
        if (!carrinho || carrinho.itens.length === 0) {
            setError("Carrinho vazio. Não é possível finalizar o pedido.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const response = await api.post('/pedidos/finalizar');
            console.log("Pedido finalizado com sucesso:", response.data);
            alert("Pedido realizado com sucesso! Você será redirecionado para seus pedidos.");
            navigate('/pedidos/meus');
        } catch (err: unknown) {
            console.error("Erro ao finalizar pedido:", err);
            let errorMessage = "Erro ao finalizar seu pedido. Por favor, tente novamente.";

            if (axios.isAxiosError(err)) {
                errorMessage = (err.response?.data as { message?: string })?.message || errorMessage;
            }
            setError(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    // Nova função para o botão de voltar
    const handleGoBack = () => {
        navigate(-1); // Volta para a página anterior no histórico
    };

    if (loading) {
        return <div className="checkout-container">Carregando carrinho para checkout...</div>;
    }

    if (error) {
        return (
            <div className="checkout-container">
                <div className="error-message">{error}</div>
                <button className="back-button" onClick={handleGoBack}>Voltar</button> {/* Botão de voltar para erros */}
            </div>
        );
    }

    if (!carrinho) {
        return (
            <div className="checkout-container">
                Não foi possível carregar o carrinho.
                <button className="back-button" onClick={handleGoBack}>Voltar</button> {/* Botão de voltar se o carrinho não carregar */}
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <h2>Confirmação do Pedido</h2>
            <div className="order-summary">
                <h3>Itens no Carrinho:</h3>
                <ul className="checkout-items-list">
                    {carrinho.itens.map(item => (
                        <li key={item.id} className="checkout-item">
                            <img src={item.imagemProduto} alt={item.nomeProduto} className="checkout-item-image" />
                            <div className="checkout-item-details">
                                <p>{item.nomeProduto} x {item.quantidade}</p>
                                <p>R$ {item.precoUnitario.toFixed(2).replace('.', ',')} cada</p>
                            </div>
                            <p className="checkout-item-subtotal">Subtotal: R$ {item.subtotal.toFixed(2).replace('.', ',')}</p>
                        </li>
                    ))}
                </ul>
                <div className="total-value">
                    <strong>Valor Total: R$ {carrinho.valorTotal.toFixed(2).replace('.', ',')}</strong>
                </div>
            </div>

            <div className="payment-options">
                <h3>Opções de Pagamento:</h3>
                <label className="payment-radio">
                    <input
                        type="radio"
                        value="vista"
                        checked={paymentOption === 'vista'}
                        onChange={() => setPaymentOption('vista')}
                    />
                    Pagar à Vista
                </label>
                <label className="payment-radio">
                    <input
                        type="radio"
                        value="parcelado"
                        checked={paymentOption === 'parcelado'}
                        onChange={() => setPaymentOption('parcelado')}
                    />
                    Pagar Parcelado
                </label>

                {paymentOption === 'parcelado' && (
                    <div className="installment-options">
                        <label>
                            Número de Parcelas:
                            <select
                                value={installments}
                                onChange={(e) => setInstallments(parseInt(e.target.value))}
                            >
                                {Array.from({ length: maxInstallments }, (_, i) => i + 1).map(num => (
                                    <option key={num} value={num}>
                                        {num}x de R$ {(carrinho.valorTotal / num).toFixed(2).replace('.', ',')}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}
            </div>

            <div className="checkout-actions"> {/* Novo div para agrupar botões */}
                <button
                    className="back-button"
                    onClick={handleGoBack}
                    disabled={isProcessing} // Desabilita se estiver processando a compra
                >
                    Voltar ao Carrinho
                </button>

                <button
                    className="confirm-purchase-button"
                    onClick={handleFinalizarPedido}
                    disabled={isProcessing}
                >
                    {isProcessing ? 'Processando...' : 'Confirmar Compra'}
                </button>
            </div>
        </div>
    );
}