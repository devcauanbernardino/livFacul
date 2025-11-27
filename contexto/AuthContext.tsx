// contexto/AuthContext.tsx
import { supabase } from "@/lib/supabase";
import React, { createContext, useContext, useState } from "react";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  avatarLocal?: { uri: string };
  avatarUrlRemota?: string | null;
  progressoLeitor?: number;
  tipoUsuario?: "leitor" | "autor" | "admin";
  divisao?: string;
};

type AuthContextType = {
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<Usuario | null>;
  loginDireto: (u: Usuario) => void;
  logout: () => Promise<void>;
  atualizarUsuario: (dados: Partial<Usuario>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // LOGIN – leitor / autor / admin
  async function login(email: string, senha: string): Promise<Usuario | null> {
    const emailNormalizado = email.toLowerCase().trim();
    console.log("[AUTH] Tentando login para:", emailNormalizado);

    const { data: authData, error: authErr } =
      await supabase.auth.signInWithPassword({
        email: emailNormalizado,
        password: senha,
      });

    if (authErr || !authData?.user) {
      console.log("[AUTH] Erro no signInWithPassword:", authErr);
      throw new Error(authErr?.message || "E-mail ou senha inválidos.");
    }

    const userId = authData.user.id;
    console.log("[AUTH] Login OK, userId:", userId);

    // Busca o perfil na tabela `usuarios`
    let perfil: any = null;
    const { data: perfilData, error: perfilErr } = await supabase
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

    if (perfilErr) {
      console.log("[AUTH] Erro ao buscar perfil em usuarios:", perfilErr);
    } else {
      perfil = perfilData;
      console.log("[AUTH] Perfil carregado de usuarios:", perfil);
    }

    const tipoBanco = perfil?.tipo_usuario;
    const tipoNormalizado: "leitor" | "autor" | "admin" =
      tipoBanco === "autor" || tipoBanco === "admin" || tipoBanco === "leitor"
        ? tipoBanco
        : "leitor";

    const usuarioFormatado: Usuario = {
      id: userId,
      nome: perfil?.nome || authData.user.user_metadata?.name || "Usuário",
      email: perfil?.email || authData.user.email || emailNormalizado,
      avatarUrlRemota: perfil?.avatar_url ?? null,
      progressoLeitor:
        typeof perfil?.progresso_leitor === "number"
          ? perfil.progresso_leitor
          : 0,
      tipoUsuario: tipoNormalizado,
      divisao: perfil?.divisao ?? "Iniciante",
    };

    console.log("[AUTH] Usuario em memória:", usuarioFormatado);

    setUsuario(usuarioFormatado);
    return usuarioFormatado;
  }

  function loginDireto(u: Usuario) {
    console.log("[AUTH] loginDireto()", u);
    setUsuario(u);
  }

  async function logout() {
    console.log("[AUTH] logout()");
    await supabase.auth.signOut();
    setUsuario(null);
  }

  function atualizarUsuario(dados: Partial<Usuario>) {
    setUsuario((prev) => (prev ? { ...prev, ...dados } : prev));
  }

  // ❌ Não restauramos sessão automaticamente
  // (sem useEffect chamando supabase.auth.getSession)

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
