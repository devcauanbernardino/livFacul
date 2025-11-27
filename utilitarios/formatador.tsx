// utilitarios/formatador.ts
// 🧾 Funções de máscara e formatação — 100% compatíveis com Android & Expo.

/**
 * Máscara para CPF: 000.000.000-00
 */
export function mascaraCPF(valor: string): string {
  if (!valor) return "";
  const d = valor.replace(/\D/g, "").slice(0, 11);

  let cpf = d.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

  return cpf;
}

/**
 * Máscara para data: DD/MM/AAAA
 */
export function mascaraData(valor: string): string {
  if (!valor) return "";
  const d = valor.replace(/\D/g, "").slice(0, 8);

  let data = d.replace(/(\d{2})(\d)/, "$1/$2");
  data = data.replace(/(\d{2})(\d)/, "$1/$2");

  return data;
}

/**
 * Telefone brasileiro:
 * (99) 99999-9999  → para 11 dígitos
 * (99) 9999-9999   → para 10 dígitos
 */
export function mascaraTelefone(valor: string): string {
  if (!valor) return "";

  const d = valor.replace(/\D/g, "").slice(0, 11);

  if (d.length <= 10) {
    // telefone fixo ou celular antigo
    return d
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  // celular novo (11 dígitos)
  return d
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

/**
 * Capitaliza nome (inclui suporte a acentos)
 */
export function capitalizarNome(nome: string): string {
  if (!nome) return "";
  return nome
    .trim()
    .toLowerCase()
    .split(/\s+/) // evita vários espaços
    .map((parte) =>
      parte.charAt(0).toUpperCase() + parte.slice(1)
    )
    .join(" ");
}
