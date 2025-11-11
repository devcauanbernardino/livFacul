// utilitarios/hash.ts
// Hash simples via SHA-256 usando WebCrypto / expo runtime.
// NÃO É bcrypt/argon2, mas resolve para o projeto da faculdade.

async function sha256Hex(texto: string): Promise<string> {
  const encoder = new TextEncoder();
  const dados = encoder.encode(texto);

  // @ts-ignore crypto.subtle existe no runtime moderno do Expo/React Native
  const hashBuffer = await crypto.subtle.digest("SHA-256", dados);

  const bytes = new Uint8Array(hashBuffer);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hex;
}

// gera o hash que vai pro banco
export async function gerarHashSenha(senhaPura: string): Promise<string> {
  return sha256Hex(senhaPura);
}

// compara senha digitada vs hash salvo
export async function compararSenha(
  senhaDigitada: string,
  hashDoBanco: string
): Promise<boolean> {
  const hashDigitada = await gerarHashSenha(senhaDigitada);
  return hashDigitada === hashDoBanco;
}
