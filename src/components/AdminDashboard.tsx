// src/components/AdminDashboard.tsx
import { useNavigate } from 'react-router-dom'; // Importe useNavigate
import './AdminDashboard.css'; // Importe o CSS para este componente

export function AdminDashboard() {
    const navigate = useNavigate();

    return (
        <div className="admin-dashboard">
            <h1>Dashboard de Administração</h1>

            <div className="dashboard-sections">
                {/* Seção de Produtos */}
                <div className="dashboard-section-card">
                    <h3>Gerenciar Produtos</h3>
                    <p>Adicione, ou inabilite produtos do catálogo.</p>
                    {/* CORRIGIDO: Mude para a rota do FRONTEND */}
                    <button onClick={() => navigate('/admin/gerenciar-produtos')}>
                        Ir para Produtos
                    </button>
                </div>

                {/* Seção de Pedidos */}
                <div className="dashboard-section-card">
                    <h3>Gerenciar Pedidos</h3>
                    <p>Visualize e processe os pedidos dos clientes.</p>
                    {/* CORRIGIDO: Mude para a rota do FRONTEND */}
                    <button onClick={() => navigate('/admin/gerenciar-pedidos')}>
                        Ir para Pedidos
                    </button>
                </div>
            </div>

        </div>
    );
}