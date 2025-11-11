// utilitarios/senha.ts
// 🔐 Funções para medir e validar a força da senha

export type Senha = {
  pontuacao: number; // 0..4
  requisitos: {
    tamanho: boolean;
    maiuscula: boolean;
    numero: boolean;
    especial: boolean;
  };
};

/**
 * Mede a força da senha digitada.
 */
export function calcularForcaSenha(senha: string): Senha {
  const tamanho = senha.length >= 8;
  const maiuscula = /[A-Z]/.test(senha);
  const numero = /[0-9]/.test(senha);
  const especial = /[^A-Za-z0-9]/.test(senha);

  const pontuacao =
    (tamanho ? 1 : 0) +
    (maiuscula ? 1 : 0) +
    (numero ? 1 : 0) +
    (especial ? 1 : 0);

  return {
    pontuacao,
    requisitos: { tamanho, maiuscula, numero, especial },
  };
}

/**
 * Regras mínimas para liberar o botão "Criar conta".
 */
export function senhaValida(s: Senha): boolean {
  const { tamanho, maiuscula, numero, especial } = s.requisitos;
  const requisitosExtras =
    (maiuscula ? 1 : 0) +
    (numero ? 1 : 0) +
    (especial ? 1 : 0);

  return tamanho && requisitosExtras >= 2;
}

/**
 * Retorna uma descrição amigável da força da senha.
 */
export function rotuloForcaSenha(pontuacao: number): string {
  if (pontuacao === 0) return "Muito fraca";
  if (pontuacao === 1) return "Fraca";
  if (pontuacao === 2) return "Média";
  if (pontuacao === 3) return "Forte";
  return "Muito forte";
}
