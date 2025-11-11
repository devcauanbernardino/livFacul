import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../src/lib/supabase";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  avatarLocal?: { uri: string };         // usado logo após cadastro/edição
  avatarUrlRemota?: string | null;       // URL salva no banco
  progressoLeitor?: number;
  tipoUsuario?: "leitor" | "autor" | "admin";
  divisao?: string;
};

type AuthContextType = {
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<void>;
  loginDireto: (u: Usuario) => void;
  logout: () => Promise<void>;
  atualizarUsuario: (dados: Partial<Usuario>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // ----------------------------
  // Login utilizando Supabase Auth + perfil em public.usuarios
  // ----------------------------
  async function login(email: string, senha: string) {
    // 1) autentica
    const { data: authData, error: authErr } =
      await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: senha,
      });

    if (authErr || !authData.user) {
      throw new Error(authErr?.message || "E-mail ou senha inválidos.");
    }

    const userId = authData.user.id;

    // 2) carrega perfil (peça por ID — é mais seguro que por e-mail)
    const { data: perfil, error: perfilErr } = await supabase
      .from("usuarios")
      .select(
        `
        id,
        nome,
        email,
        avatar_url,
        progresso_leitor,
        tipo_usuario,
        divisao
      `
      )
      .eq("id", userId)
      .single();

    if (perfilErr || !perfil) {
      // se não existir linha em usuarios, crie um fallback mínimo
      setUsuario({
        id: userId,
        nome: authData.user.user_metadata?.name || "Usuário",
        email: authData.user.email || email,
        avatarUrlRemota: null,
        progressoLeitor: 0,
        tipoUsuario: "leitor",
        divisao: "Iniciante",
      });
      return;
    }

    // 3) popula o contexto
    setUsuario({
      id: perfil.id,
      nome: perfil.nome,
      email: perfil.email,
      avatarUrlRemota: perfil.avatar_url ?? null,
      progressoLeitor:
        typeof perfil.progresso_leitor === "number" ? perfil.progresso_leitor : 0,
      tipoUsuario: perfil.tipo_usuario ?? "leitor",
      divisao: perfil.divisao ?? "Iniciante",
    });
  }

  function loginDireto(u: Usuario) {
    setUsuario(u);
  }

  async function logout() {
    await supabase.auth.signOut(); // encerra sessão no Supabase
    setUsuario(null);
  }

  function atualizarUsuario(dados: Partial<Usuario>) {
    setUsuario((prev) => (prev ? { ...prev, ...dados } : prev));
  }

  // Restaura sessão se já existir (opcional)
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const sess = data.session;
      if (!sess?.user) return;

      const { data: perfil } = await supabase
        .from("usuarios")
        .select(
          `
          id, nome, email, avatar_url, progresso_leitor, tipo_usuario, divisao
        `
        )
        .eq("id", sess.user.id)
        .single();

      if (perfil) {
        setUsuario({
          id: perfil.id,
          nome: perfil.nome,
          email: perfil.email,
          avatarUrlRemota: perfil.avatar_url ?? null,
          progressoLeitor:
            typeof perfil.progresso_leitor === "number" ? perfil.progresso_leitor : 0,
          tipoUsuario: perfil.tipo_usuario ?? "leitor",
          divisao: perfil.divisao ?? "Iniciante",
        });
      }
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{ usuario, login, loginDireto, logout, atualizarUsuario }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
