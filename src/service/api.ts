// src/service/api.ts
import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:8080/api', // VERIFIQUE SE ESTA É A URL CORRETA DO SEU BACKEND
    timeout: 10000,
});

api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Mantenha este interceptor de resposta, mas ele não precisará mais fazer o logout direto
// O AuthContext cuidará do logout se necessário.
api.interceptors.response.use(
    response => response,
    error => {
        // Se houver um 401 ou 403, pode ser que o token esteja expirado ou inválido.
        // Neste ponto, o AuthContext ou o Router (com um Guard) podem ser notificados
        // para lidar com a expiração da sessão, redirecionando para o login.
        // Remover localStorage.removeItem e redirecionamento daqui se o AuthContext for gerenciar.
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Requisição não autorizada ou token inválido. O AuthContext deve lidar com isso.");
            // Não faça logout aqui diretamente para evitar ciclos, o contexto fará.
            // Poderíamos disparar um evento ou chamar uma função global se necessário.
        }
        return Promise.reject(error);
    }
);