// utilitarios/formatador.ts
// 🧾 Funções de máscara (CPF, data, etc.) — compatíveis com Android e Expo.

/**
 * Máscara para CPF: 000.000.000-00
 */
export function mascaraCPF(valor: string): string {
  if (!valor) return "";
  const d = valor.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/**
 * Máscara para data de nascimento: DD/MM/AAAA
 */
export function mascaraData(valor: string): string {
  if (!valor) return "";
  const d = valor.replace(/\D/g, "").slice(0, 8);
  return d
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2");
}

/**
 * Máscara para telefone celular brasileiro: (99) 99999-9999
 */
export function mascaraTelefone(valor: string): string {
  if (!valor) return "";
  const d = valor.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

/**
 * Formata uma string para letras maiúsculas no início de cada palavra.
 */
export function capitalizarNome(nome: string): string {
  if (!nome) return "";
  return nome
    .toLowerCase()
    .split(" ")
    .filter((parte) => parte.trim() !== "")
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
}
