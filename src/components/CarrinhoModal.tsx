// src/components/CarrinhoModal.tsx
import React from 'react';
import { Modal } from './Modal'; // Reutiliza seu componente Modal
import type { CarrinhoFront, ItemCarrinhoFront } from '../types/CarrinhoTypes.ts';
import './CarrinhoModal.css'; // Crie este arquivo CSS

interface CarrinhoModalProps {
    isOpen: boolean;
    onClose: () => void;
    carrinho: CarrinhoFront | null;
    onUpdateQuantity: (itemId: number, quantidade: number) => void;
    onRemoveItem: (itemId: number) => void;
    onFinalizePurchase: () => void;
}

export function CarrinhoModal({ isOpen, onClose, carrinho, onUpdateQuantity, onRemoveItem, onFinalizePurchase }: CarrinhoModalProps) {
    if (!isOpen) return null;

    const handleQuantityChange = (item: ItemCarrinhoFront, event: React.ChangeEvent<HTMLInputElement>) => {
        const newQuantity = parseInt(event.target.value);
        // Garante que a quantidade é um número válido e não é negativa
        if (!isNaN(newQuantity) && newQuantity >= 0) {
            onUpdateQuantity(item.id, newQuantity);
        } else if (isNaN(newQuantity) && event.target.value === "") {
            // Permite o campo de entrada ficar vazio brevemente enquanto o usuário digita
        } else if (newQuantity < 0) {
            onUpdateQuantity(item.id, 0); // Força para 0 se o usuário tentar digitar negativo
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="carrinho-modal-content">
                <h2>Seu Carrinho</h2>
                {/* Verifica se carrinho é não nulo E se itens existe E se itens não está vazio */}
                {carrinho && carrinho.itens && carrinho.itens.length > 0 ? (
                    <>
                        <ul className="carrinho-list">
                            {carrinho.itens.map(item => (
                                <li key={item.id} className="carrinho-item">
                                    <img src={item.imagemProduto} alt={item.nomeProduto} className="item-image" />
                                    <div className="item-details">
                                        <h3>{item.nomeProduto}</h3>
                                        <p>Preço Unitário: R$ {item.precoUnitario.toFixed(2).replace('.', ',')}</p>
                                        <div className="quantity-control">
                                            <button onClick={() => onUpdateQuantity(item.id, item.quantidade - 1)}>-</button>
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.quantidade}
                                                onChange={(e) => handleQuantityChange(item, e)}
                                                onBlur={(e) => { // Importante para lidar com campos vazios ou zeros
                                                    const val = parseInt(e.target.value);
                                                    if (isNaN(val) || val <= 0) {
                                                        onUpdateQuantity(item.id, 0); // Remove item se a quantidade for 0 ou inválida ao perder o foco
                                                    }
                                                }}
                                            />
                                            <button onClick={() => onUpdateQuantity(item.id, item.quantidade + 1)}>+</button>
                                        </div>
                                        <p>Subtotal: R$ {item.subtotal.toFixed(2).replace('.', ',')}</p>
                                    </div>
                                    <button className="remove-item-button" onClick={() => onRemoveItem(item.id)}>Remover</button>
                                </li>
                            ))}
                        </ul>
                        <div className="carrinho-summary-modal">
                            <h3>Total do Carrinho: R$ {carrinho.valorTotal.toFixed(2).replace('.', ',')}</h3>
                            <button className="finalize-purchase-button" onClick={onFinalizePurchase}>
                                Continuar para o Pagamento
                            </button>
                        </div>
                    </>
                ) : (
                    <p>Seu carrinho está vazio.</p>
                )}
                <button className="close-modal-button" onClick={onClose}>Fechar</button>
            </div>
        </Modal>
    );
}