// src/model/Produto.ts

export enum Categoria {
    LANCHE = 'LANCHE',
    BEBIDA = 'BEBIDA',
    SOBREMESA = 'SOBREMESA',
    PRATO_PRINCIPAL = 'PRATO_PRINCIPAL',
    APERITIVO = 'APERITIVO',
    // Certifique-se de que os valores aqui correspondem EXATAMENTE aos nomes do seu enum no backend (em maiúsculas).
}

export type Produto = {
    id: number;
    nome: string;
    descricao: string;
    preco: number;
    imagem: string;
    categoria: Categoria; // CORRIGIDO: Agora é do tipo Categoria (seu enum)
    disponibilidade: boolean;
};