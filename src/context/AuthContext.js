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
    // Ao carregar a página, verifica se tem token salvo
    const token = Cookies.get("centralmed_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // O token tem { sub: "usuario", perfil: "ADMIN", ... }
        setUser({
          login: decoded.sub,
          perfil: decoded.perfil,
          nome: decoded.sub, // Backend pode mandar nome nos claims se quiser
        });
        api.defaults.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        logout();
      }
    }
  }, []);

  async function login(usuario, senha) {
    try {
      const response = await api.post("/auth/login", { login: usuario, senha });
      const { token } = response.data;

      Cookies.set("centralmed_token", token, { expires: 1 }); // 1 dia
      api.defaults.headers.Authorization = `Bearer ${token}`;

      const decoded = jwtDecode(token);
      setUser({
        login: decoded.sub,
        perfil: decoded.perfil,
        nome: decoded.sub,
      });

      router.push("/"); // Vai para Dashboard
    } catch (error) {
      console.error(error);
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
  return useContext(AuthContext);
}
