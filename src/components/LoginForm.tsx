import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { api } from '../service/api';
import { useNavigate, Link } from 'react-router-dom'; // <--- Importe 'Link' aqui
import { useAuth } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import './LoginForm.css';


export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        // Adiciona a classe ao body quando o componente LoginForm é montado
        document.body.classList.add('login-background');

        // Retorna uma função de limpeza que será executada quando o componente for desmontado
        return () => {
            document.body.classList.remove('login-background');
        };
    }, []); // Array de dependências vazio para que o efeito rode apenas na montagem/desmontagem


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("1. LoginForm: handleSubmit acionado.");

        setLoading(true);
        setError('');

        try {
            console.log("2. LoginForm: Tentando enviar requisição para:", api.defaults.baseURL + '/auth/signin');
            const response = await api.post('/auth/signin', { email, password });
            console.log("3. LoginForm: Resposta da API recebida:", response.status, response.data);

            const token = response.data.accessToken;

            if (token) {
                console.log("4. LoginForm: Token recebido. Chamando AuthContext.login().");
                login(token);

                const decodedToken: { roles?: string[] } = jwtDecode(token);
                const roles = Array.isArray(decodedToken.roles) ? decodedToken.roles : [];

                if (roles.includes('ROLE_ADMIN')) {
                    console.log("5. LoginForm: Usuário ADMIN. Navegando para /admin-dashboard.");
                    navigate('/admin-dashboard', { replace: true });
                } else {
                    console.log("5. LoginForm: Usuário NÃO ADMIN. Navegando para /.");
                    navigate('/', { replace: true });
                }

            } else {
                console.log("4. LoginForm: Token JWT não recebido na resposta.");
                setError('Token JWT não recebido.');
            }
        } catch (err: unknown) {
            console.error("ERRO NO LOGIN (CATCH):", err);
            if (err instanceof AxiosError) {
                const backendMessage = err.response?.data?.message || err.response?.data?.error;
                setError(backendMessage || 'Erro de rede ou credenciais inválidas.');
            } else {
                setError('Ocorreu um erro inesperado.');
            }
        } finally {
            setLoading(false);
            console.log("6. LoginForm: Finalizando submissão.");
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="text"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Senha:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="login-button"
                >
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
                {/* NOVO ELEMENTO: Link para Registro */}
                <p className="register-text">
                    Não tem uma conta? <Link to="/register">Cadastre-se aqui</Link>
                </p>
            </form>
        </div>
    );
}