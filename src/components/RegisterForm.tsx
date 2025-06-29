// src/components/RegisterForm.tsx
import { useState } from 'react';
import { AxiosError } from 'axios';
import { api } from '../service/api';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterForm.css';

export function RegisterForm() {
    // CORREÇÃO AQUI: Renomear 'name' para 'nome' para bater com o DTO do backend
    const [nome, setNome] = useState(''); // Alterado de 'name' para 'nome'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem!');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/auth/signup', {
                nome, // CORREÇÃO AQUI: Enviar 'nome' em vez de 'name'
                email,
                password
            });

            if (response.status === 201 || response.status === 200) {
                setSuccessMessage('Registro realizado com sucesso! Você pode fazer login agora.');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError('Ocorreu um erro ao tentar registrar. Por favor, tente novamente.');
            }

        } catch (err: unknown) {
            console.error("ERRO NO REGISTRO (CATCH):", err);
            if (err instanceof AxiosError) {
                const backendMessage = err.response?.data?.message || err.response?.data?.error;
                // Se o backend enviar erros de validação específicos, podemos exibi-los
                if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                    const validationErrors = err.response.data.errors.map((e: any) => e.defaultMessage || e.message).join('; ');
                    setError(`Falha na validação: ${validationErrors}`);
                } else {
                    setError(backendMessage || 'Erro ao registrar. Verifique seus dados.');
                }
            } else {
                setError('Ocorreu um erro inesperado ao registrar.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <h2>Registrar</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="nome">Nome:</label> {/* CORREÇÃO AQUI: htmlFor="nome" */}
                    <input
                        type="text"
                        id="nome" // CORREÇÃO AQUI: id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)} // CORREÇÃO AQUI: setNome
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
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
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirmar Senha:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="register-button"
                >
                    {loading ? 'Registrando...' : 'Registrar'}
                </button>

                <p className="login-text">
                    Já tem uma conta? <Link to="/login">Faça login aqui</Link>
                </p>
            </form>
        </div>
    );
}