// src/App.tsx
import { type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ProdutoLista } from './components/ProdutoLista';
import { LoginForm } from './components/LoginForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminDashboard } from './components/AdminDashboard';
import './App.css';
import { GerenciarProdutos } from "./components/GerenciarProdutos.tsx";
import { GerenciarPedidos } from "./components/GerenciarPedidos.tsx";
import { CheckoutPage } from "./components/CheckoutPage.tsx";
import { MeusPedidosPage } from './components/MeusPedidosPage';
import {RegisterForm} from "./components/RegisterForm.tsx"; // <-- IMPORTADO

// Componente para proteger rotas
const PrivateRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, loadingAuth } = useAuth();

    if (loadingAuth) {
        return <p>Verificando autenticação...</p>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Componente AdminRoute
const AdminRoute = ({ children }: { children: ReactNode }) => {
    const { userRoles } = useAuth();
    return userRoles.includes('ROLE_ADMIN') ? children : <Navigate to="/" replace />;
};

function AppContent() {
    const { isAuthenticated, logout, userRoles, hasRole } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="App">
            <header className="App-header">
                {isAuthenticated ? (
                    <div className="authenticated-actions"> {/* <-- CLASSE PARA ESTILIZAÇÃO */}
                        <button onClick={logout}>Logout</button>

                        {userRoles.includes('ROLE_ADMIN') && (
                            <button onClick={() => navigate('/admin-dashboard')}>
                                Dashboard
                            </button>
                        )}
                        {isAuthenticated && hasRole('ROLE_CLIENTE') && ( // <--- A VERIFICAÇÃO CHAVE AQUI
                            <button
                                onClick={() => navigate('/pedidos/meus')}
                                className="nav-button" // Adicione uma classe CSS se desejar estilizar
                            >
                                Meus Pedidos
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="LogoDiv">
                        <p className="Logo">Moro Burger</p>
                        <img src="/redlinepng.png" alt="Linha vermelha" />
                    </div>
                )}
            </header>

            <Routes>
                <Route path="/login" element={<LoginForm />} />

                <Route
                    path="/admin-dashboard"
                    element={
                        <PrivateRoute>
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/admin/gerenciar-produtos"
                    element={
                        <PrivateRoute>
                            <AdminRoute>
                                <GerenciarProdutos />
                            </AdminRoute>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/admin/gerenciar-pedidos"
                    element={
                        <PrivateRoute>
                            <AdminRoute>
                                <GerenciarPedidos />
                            </AdminRoute>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/checkout"
                    element={
                        <PrivateRoute>
                            <CheckoutPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/pedidos/meus"
                    element={
                        <PrivateRoute>
                            <MeusPedidosPage /> {/* <-- RENDERIZA O COMPONENTE */}
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <ProdutoLista />
                        </PrivateRoute>
                    }
                />
                <Route path="/register" element={<RegisterForm />} /> {/* <-- Adicione esta rota */}

            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;