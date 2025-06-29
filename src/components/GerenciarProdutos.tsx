// src/components/GerenciarProdutos.tsx
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { api } from '../service/api';
import './GerenciarProdutos.css';
import { Modal } from './Modal'; // Certifique-se de que o caminho para o Modal está correto

// --- Interfaces e Tipos ---

// Defina as categorias como um tipo de união de strings literais, espelhando seu enum Java
type CategoriaProduto = 'LANCHE' | 'BEBIDA' | 'SOBREMESA' | 'PRATO_PRINCIPAL' | 'APERITIVO';

// As categorias disponíveis para o dropdown no formulário de edição/adição
const CATEGORIAS_PRODUTO: CategoriaProduto[] = ['LANCHE', 'BEBIDA', 'SOBREMESA', 'PRATO_PRINCIPAL', 'APERITIVO'];

// Interface para o produto, incluindo todos os campos para edição
interface Produto {
    id: number;
    nome: string;
    descricao: string;
    preco: number;
    categoria: CategoriaProduto; // Agora usando o tipo CategoriaProduto
    disponibilidade: boolean;
    imagem: string;
}

// --- Componente GerenciarProdutos ---

export function GerenciarProdutos() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Produto | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // NOVO ESTADO: Para controlar a abertura do modal de adição de produto
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);


    // Função para buscar produtos (refatorada para ser reutilizável)
    const fetchProdutos = async () => {
        try {
            setLoading(true); // Indica carregamento ao iniciar a busca
            const response = await api.get<Produto[]>('/produtos');
            setProdutos(response.data);
            setError(null); // Limpa erros anteriores
        } catch (err) {
            console.error("Erro ao carregar produtos:", err);
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || err.message || "Erro de rede ao carregar produtos.");
            } else {
                setError("Ocorreu um erro inesperado ao carregar produtos.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Efeito para carregar os produtos na montagem do componente
    useEffect(() => {
        fetchProdutos();
    }, []);

    // --- Funções de Ação ---

    const handleToggleDisponibilidade = async (produto: Produto) => {
        setLoading(true);
        try {
            // Cria um objeto com os dados atualizados do produto
            const updatedProductData = {
                ...produto,
                disponibilidade: !produto.disponibilidade // Inverte a disponibilidade
            };
            await api.put(`/produtos/${produto.id}`, updatedProductData);
            setSuccessMessage(`Disponibilidade de "${produto.nome}" alterada com sucesso!`);
            fetchProdutos(); // Recarrega a lista para refletir a mudança
        } catch (err) {
            console.error(`Erro ao alterar disponibilidade de ${produto.nome}:`, err);
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || err.message || "Erro ao alterar disponibilidade.");
            } else {
                setError("Ocorreu um erro inesperado ao alterar disponibilidade.");
            }
        } finally {
            setLoading(false);
            // Limpa a mensagem de sucesso/erro após alguns segundos
            setTimeout(() => setSuccessMessage(null), 3000);
            setTimeout(() => setError(null), 3000);
        }
    };
    const openEditModal = (produto: Produto) => {
        setCurrentProduct(produto); // Define o produto a ser editado
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setCurrentProduct(null); // Limpa o produto atual
        setSuccessMessage(null); // Limpa mensagens de sucesso
        setError(null); // Limpa mensagens de erro
    };

    const handleSaveEdit = async (editedProduct: Produto) => {
        setLoading(true);
        try {
            await api.put(`/produtos/${editedProduct.id}`, editedProduct);
            setSuccessMessage(`Produto "${editedProduct.nome}" atualizado com sucesso!`);
            closeEditModal(); // Fecha o modal
            fetchProdutos(); // Recarrega a lista
        } catch (err) {
            console.error(`Erro ao atualizar produto ${editedProduct.nome}:`, err);
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || err.message || "Erro ao atualizar produto.");
            } else {
                setError("Ocorreu um erro inesperado ao atualizar o produto.");
            }
        } finally {
            setLoading(false);
            setTimeout(() => setSuccessMessage(null), 3000);
            setTimeout(() => setError(null), 3000);
        }
    };

    // NOVAS FUNÇÕES: Para abrir/fechar e adicionar produto
    const handleOpenAddProductModal = () => {
        setIsAddProductModalOpen(true);
        setSuccessMessage(null); // Limpa mensagens anteriores
        setError(null); // Limpa erros anteriores
    };

    const handleCloseAddProductModal = () => {
        setIsAddProductModalOpen(false);
    };

    const handleAddNewProduct = async (newProductData: Omit<Produto, 'id'>) => { // 'Omit' para excluir 'id'
        setLoading(true);
        try {
            await api.post('/produtos', newProductData);
            setSuccessMessage(`Produto "${newProductData.nome}" adicionado com sucesso!`);
            handleCloseAddProductModal(); // Fecha o modal
            fetchProdutos(); // Recarrega a lista para incluir o novo produto
        } catch (err) {
            console.error("Erro ao adicionar novo produto:", err);
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || err.message || "Erro ao adicionar produto.");
            } else {
                setError("Ocorreu um erro inesperado ao adicionar o produto.");
            }
        } finally {
            setLoading(false);
            setTimeout(() => setSuccessMessage(null), 3000);
            setTimeout(() => setError(null), 3000);
        }
    };


    // Exibe "Carregando produtos..." apenas na busca inicial se não houver produtos
    if (loading && produtos.length === 0) {
        return (
            <div className="gerenciar-produtos-container">
                <h2>Página de Gerenciamento de Produtos</h2>
                <p>Carregando produtos...</p>
            </div>
        );
    }

    return (
        <div className="gerenciar-produtos-container">
            <h2>Página de Gerenciamento de Produtos</h2>
            <p>Gerencie os produtos do seu catálogo:</p>

            {/* O novo botão para adicionar produto */}
            <button
                className="add-product-button"
                onClick={handleOpenAddProductModal}
            >
                Adicionar Novo Produto
            </button>

            {/* Mensagens de sucesso e erro */}
            {successMessage && <div className="success-message">{successMessage}</div>}
            {error && <div className="error-message">{error}</div>}

            {/* Overlay de loading para operações que não são a busca inicial vazia */}
            {loading && produtos.length > 0 && <div className="loading-overlay">Atualizando...</div>}


            {produtos.length > 0 ? (
                <ul className="produtos-list">
                    {produtos.map((produto) => (
                        <li key={produto.id} className={`produto-item ${!produto.disponibilidade ? 'disabled-product' : ''}`}>
                            <div className="produto-info">
                                <strong>{produto.nome}</strong> - R${produto.preco.toFixed(2)}
                                <br />
                                <small>{produto.descricao}</small>
                                <br />
                                <small>Categoria: {produto.categoria.replace(/_/g, ' ')}</small> {/* Formata para exibição */}
                                <br />
                                <span className={`status ${produto.disponibilidade ? 'available' : 'unavailable'}`}>
                                    {produto.disponibilidade ? 'Disponível' : 'Indisponível'}
                                </span>
                            </div>
                            <div className="produto-actions">
                                <button
                                    className="edit-button"
                                    onClick={() => openEditModal(produto)}
                                >
                                    Editar
                                </button>
                                <button
                                    className={`toggle-disponibilidade-button ${produto.disponibilidade ? 'disable' : 'enable'}`}
                                    onClick={() => handleToggleDisponibilidade(produto)}
                                >
                                    {produto.disponibilidade ? 'Desabilitar' : 'Habilitar'}
                                </button>

                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nenhum produto encontrado. Clique em "Adicionar Novo Produto" para começar!</p>
            )}

            {/* Modal de Edição (existente) */}
            <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
                {currentProduct && (
                    <ProdutoEditForm
                        produto={currentProduct}
                        onSave={handleSaveEdit}
                        onCancel={closeEditModal}
                        categorias={CATEGORIAS_PRODUTO} // Passa as categorias
                    />
                )}
            </Modal>

            {/* NOVO MODAL: Para Adicionar Produto */}
            <Modal isOpen={isAddProductModalOpen} onClose={handleCloseAddProductModal}>
                <ProdutoAddForm
                    onSave={handleAddNewProduct}
                    onCancel={handleCloseAddProductModal}
                    categorias={CATEGORIAS_PRODUTO} // Passa as categorias
                />
            </Modal>
        </div>
    );
}

// --- Componente: ProdutoEditForm (para o modal de edição) ---

interface ProdutoEditFormProps {
    produto: Produto;
    onSave: (produto: Produto) => void;
    onCancel: () => void;
    categorias: CategoriaProduto[]; // Adicionado para receber as categorias
}

function ProdutoEditForm({ produto, onSave, onCancel, categorias }: ProdutoEditFormProps) {
    const [formData, setFormData] = useState<Produto>(produto);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        let processedValue: string | number | boolean = value;

        if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
            processedValue = e.target.checked;
        } else if (name === 'preco') {
            processedValue = parseFloat(value);
            if (isNaN(processedValue)) { // Lida com o caso de valor não numérico
                processedValue = 0; // Ou algum valor padrão/erro
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="produto-edit-form">
            <h3>Editar Produto: {produto.nome}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="edit-nome">Nome:</label>
                    <input type="text" id="edit-nome" name="nome" value={formData.nome} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="edit-descricao">Descrição:</label>
                    <textarea id="edit-descricao" name="descricao" value={formData.descricao} onChange={handleChange} required></textarea>
                </div>
                <div className="form-group">
                    <label htmlFor="edit-preco">Preço:</label>
                    <input type="number" id="edit-preco" name="preco" value={formData.preco} onChange={handleChange} step="0.01" required />
                </div>
                <div className="form-group">
                    <label htmlFor="edit-categoria">Categoria:</label>
                    <select id="edit-categoria" name="categoria" value={formData.categoria} onChange={handleChange} required>
                        {categorias.map(cat => (
                            <option key={cat} value={cat}>
                                {cat.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group form-group-checkbox"> {/* Nova classe para alinhar checkbox */}
                    <label htmlFor="edit-disponibilidade">Disponível:</label>
                    <input type="checkbox" id="edit-disponibilidade" name="disponibilidade" checked={formData.disponibilidade} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="edit-imagem">URL da Imagem:</label>
                    <input type="text" id="edit-imagem" name="imagem" value={formData.imagem} onChange={handleChange} />
                </div>
                <div className="form-actions">
                    <button type="submit" className="confirm-button">Salvar</button>
                    <button type="button" className="cancel-button" onClick={onCancel}>Cancelar</button>
                </div>
            </form>
        </div>
    );
}

// --- NOVO COMPONENTE: ProdutoAddForm (para o modal de adição) ---

interface ProdutoAddFormProps {
    onSave: (produto: Omit<Produto, 'id'>) => void; // Não precisamos do 'id' ao adicionar
    onCancel: () => void;
    categorias: CategoriaProduto[];
}

function ProdutoAddForm({ onSave, onCancel, categorias }: ProdutoAddFormProps) {
    // Estado inicial para um novo produto (valores padrão)
    const [formData, setFormData] = useState<Omit<Produto, 'id'>>({
        nome: '',
        descricao: '',
        preco: 0,
        categoria: categorias[0] || 'LANCHE', // Define a primeira categoria como padrão
        disponibilidade: true, // Novo produto geralmente é disponível por padrão
        imagem: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        let processedValue: string | number | boolean = value;

        if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
            processedValue = e.target.checked;
        } else if (name === 'preco') {
            processedValue = parseFloat(value);
            if (isNaN(processedValue)) {
                processedValue = 0;
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="produto-edit-form">
            <h3>Adicionar Novo Produto</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="add-nome">Nome:</label>
                    <input type="text" id="add-nome" name="nome" value={formData.nome} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="add-descricao">Descrição:</label>
                    <textarea id="add-descricao" name="descricao" value={formData.descricao} onChange={handleChange} required></textarea>
                </div>
                <div className="form-group">
                    <label htmlFor="add-preco">Preço:</label>
                    <input type="number" id="add-preco" name="preco" value={formData.preco} onChange={handleChange} step="0.01" required />
                </div>
                <div className="form-group">
                    <label htmlFor="add-categoria">Categoria:</label>
                    <select id="add-categoria" name="categoria" value={formData.categoria} onChange={handleChange} required>
                        {categorias.map(cat => (
                            <option key={cat} value={cat}>
                                {cat.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group form-group-checkbox">
                    <label htmlFor="add-disponibilidade">Disponível:</label>
                    <input type="checkbox" id="add-disponibilidade" name="disponibilidade" checked={formData.disponibilidade} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="add-imagem">URL da Imagem:</label>
                    <input type="text" id="add-imagem" name="imagem" value={formData.imagem} onChange={handleChange} />
                </div>
                <div className="form-actions">
                    <button type="submit" className="confirm-button">Adicionar</button>
                    <button type="button" className="cancel-button" onClick={onCancel}>Cancelar</button>
                </div>
            </form>
        </div>
    );
}