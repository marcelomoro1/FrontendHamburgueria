// src/types/CarrinhoTypes.ts

export interface ItemCarrinhoFront {
    id: number; // ID do ItemCarrinho no backend
    produtoId: number;
    nomeProduto: string;
    imagemProduto: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
}

export interface CarrinhoFront {
    id: number; // ID do carrinho no backend
    userId: number;
    userName: string; // Adicionado do backend
    itens: ItemCarrinhoFront[];
    valorTotal: number;
}

export interface ItemPedidoFront {
    id: number;
    produtoId: number;
    nomeProduto: string;
    imagemProduto: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
}

// --- ADICIONE ESTE ENUM AQUI ---
export type StatusPedido = 'PENDENTE' | 'FINALIZADO' | 'CANCELADO';


export interface PedidoFront {
    id: number;
    userId: number;
    userName: string;
    dataPedido: string;
    status: StatusPedido;
    valorTotal: number;
    itens: ItemPedidoFront[];
}