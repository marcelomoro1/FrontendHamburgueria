// src/contexts/AuthContext.tsx
import { createContext, useState, useEffect, useContext, useCallback } from 'react'; // Adicione useCallback
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // <-- Importe jwtDecode

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    userRoles: string[];
    userId: number | null;
    login: (newToken: string) => void;
    logout: () => void;
    loadingAuth: boolean;
    // --- ADICIONADO: Definição da função hasRole na interface ---
    hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

    // Função auxiliar para decodificar o token e extrair roles E userId
    const decodeTokenAndSetAuthData = useCallback((jwtToken: string): boolean => {
        try {
            // Ajuste a tipagem de 'decoded' para incluir 'userId' e 'roles'
            // IMPORTANTE: 'roles' e 'id' devem bater com os nomes das claims no seu JWT gerado pelo backend
            const decoded: { roles?: string[]; id?: number } = jwtDecode(jwtToken); // Mudei 'userId' para 'id' aqui, ajuste se necessário!

            const roles = Array.isArray(decoded.roles) ? decoded.roles : [];
            setUserRoles(roles);

            // Garante que userId é um número ou null. O nome da claim 'id' deve corresponder ao backend
            const extractedUserId = typeof decoded.id === 'number' ? decoded.id : null; // Mudei 'userId' para 'id' aqui
            setUserId(extractedUserId);

            console.log("AuthContext: Roles decodificadas do JWT:", roles);
            console.log("AuthContext: User ID decodificado do JWT:", extractedUserId);

            return true;
        } catch (error) {
            console.error("Falha ao decodificar JWT ou extrair dados (roles/userId):", error);
            setUserRoles([]);
            setUserId(null);
            return false;
        }
    }, []); // decodeTokenAndSetAuthData agora usa useCallback para otimização

    useEffect(() => {
        const storedToken = localStorage.getItem('jwtToken');
        if (storedToken) {
            if (decodeTokenAndSetAuthData(storedToken)) {
                setToken(storedToken);
                setIsAuthenticated(true);
            } else {
                localStorage.removeItem('jwtToken');
                setToken(null);
                setIsAuthenticated(false);
            }
        }
        setLoadingAuth(false);
    }, [decodeTokenAndSetAuthData]); // Adicione decodeTokenAndSetAuthData como dependência

    const login = (newToken: string) => {
        localStorage.setItem('jwtToken', newToken);
        setToken(newToken);
        if (decodeTokenAndSetAuthData(newToken)) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            localStorage.removeItem('jwtToken');
            setToken(null);
        }
    };

    const logout = () => {
        localStorage.removeItem('jwtToken');
        setToken(null);
        setIsAuthenticated(false);
        setUserRoles([]);
        setUserId(null);
    };

    // --- NOVO: Implementação da função hasRole usando useCallback ---
    const hasRole = useCallback((role: string): boolean => {
        // Verifica se o array userRoles contém a role especificada
        return userRoles.includes(role);
    }, [userRoles]); // userRoles é a dependência, para que a função seja recriada apenas quando roles mudarem

    return (
        // --- ADICIONADO: hasRole no objeto de valor do provedor ---
        <AuthContext.Provider value={{ isAuthenticated, token, userRoles, userId, login, logout, loadingAuth, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};