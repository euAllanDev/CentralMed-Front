"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Controla o estado inicial de carregamento
  const router = useRouter();

  // Roda uma única vez, quando o app carrega pela primeira vez no navegador
  useEffect(() => {
    const token = Cookies.get("centralmed_token");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Proteção: se o token já expirou, força logout
        if (decoded.exp * 1000 < Date.now()) {
          logout(); // logout() já redireciona para /login
          return;
        }

        // Se o token é válido, configura o usuário e a API
        setUser({
          login: decoded.sub,
          perfil: decoded.perfil,
          nome: decoded.nome,
        });

        // Re-injeta o token no cabeçalho padrão do Axios
        api.defaults.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        console.error("Token inválido ou corrompido.", err);
        logout();
      }
    }
    // Finaliza o carregamento inicial, permitindo a renderização do conteúdo
    setLoading(false);
  }, []);

  async function login(usuario, senha) {
    try {
      const response = await api.post("/auth/login", { login: usuario, senha });

      if (response.status === 200 && response.data && response.data.token) {
        const { token } = response.data;

        // Salva o token no Cookie e configura a API
        Cookies.set("centralmed_token", token, { expires: 1 });
        api.defaults.headers.Authorization = `Bearer ${token}`;

        const decoded = jwtDecode(token);
        setUser({
          login: decoded.sub,
          perfil: decoded.perfil,
          nome: decoded.nome,
        });

        // Redireciona para a página correta com base no perfil
        switch (decoded.perfil) {
          case "RECEPCAO":
            router.push("/recepcao");
            break;
          case "MEDICO":
            router.push("/medico");
            break;
          case "ENFERMAGEM":
            router.push("/triagem");
            break;
          default:
            router.push("/"); // ADMIN
        }
      } else {
        throw new Error("Resposta de login inválida.");
      }
    } catch (error) {
      console.error("Falha no login:", error.response?.data || error.message);
      throw new Error("Usuário ou senha inválidos.");
    }
  }

  function logout() {
    Cookies.remove("centralmed_token");
    setUser(null);
    delete api.defaults.headers.Authorization;
    router.push("/login");
  }

  // Enquanto estiver verificando o token, não renderiza nada para evitar erro de hidratação.
  // Isso garante que o servidor e o cliente inicial rendenrizem o mesmo HTML (nada).
  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
