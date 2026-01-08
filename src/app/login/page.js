"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ usuario: "", senha: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(form.usuario, form.senha);
    } catch (err) {
      setError("Login falhou. Verifique suas credenciais.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-96">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-700">CentralMed</h1>
          <p className="text-gray-500 text-sm">Acesse o sistema</p>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 text-xs rounded border border-red-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Usuário"
              className="w-full pl-10 p-2 border rounded focus:outline-blue-500"
              value={form.usuario}
              onChange={(e) => setForm({ ...form, usuario: e.target.value })}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Senha"
              className="w-full pl-10 p-2 border rounded focus:outline-blue-500"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-700 text-white p-2 rounded font-bold hover:bg-blue-800 transition-colors"
          >
            ENTRAR
          </button>
        </form>
      </div>
    </div>
  );
}
