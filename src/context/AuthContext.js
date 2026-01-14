"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("centralmed_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        // Proteção contra token expirado
        if (decoded.exp * 1000 < Date.now()) {
          logout();
          return;
        }

        setUser({
          login: decoded.sub,
          perfil: decoded.perfil,
          nome: decoded.nome, // Buscando o nome do token agora
        });
        
        // Re-injeta o token no Axios em cada recarregamento
        api.defaults.headers.Authorization = `Bearer ${token}`;

      } catch (err) {
        logout();
      }
    }
  }, []);

  async function login(usuario, senha) {
    try {
      const response = await api.post("/auth/login", { login: usuario, senha });
      
      // --- CORREÇÃO IMPORTANTE AQUI ---
      // 1. Verifica se a resposta foi sucesso (status 200)
      // 2. Verifica se a resposta contém os dados e o token
      if (response.status === 200 && response.data && response.data.token) {
        const { token } = response.data;

        Cookies.set("centralmed_token", token, { expires: 1 });
        api.defaults.headers.Authorization = `Bearer ${token}`;

        const decoded = jwtDecode(token);
        setUser({
          login: decoded.sub,
          perfil: decoded.perfil,
          nome: decoded.nome,
        });

        // Redirecionamento inteligente
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
            router.push("/");
        }
      } else {
        // Se a resposta for 200, mas não tiver token (caso estranho)
        throw new Error("Resposta de login inválida do servidor.");
      }

    } catch (error) {
      // O 'catch' do Axios já pega erros 401, 403, 500, etc.
      console.error("Falha no login:", error);
      throw new Error("Usuário ou senha inválidos");
    }
  }

  function logout() {
    Cookies.remove("centralmed_token");
    setUser(null);
    delete api.defaults.headers.Authorization;
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}