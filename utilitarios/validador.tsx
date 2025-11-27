// Valida CPF (formato e dígitos verificadores)
export function validarCPF(raw: string): boolean {
  const cpf = raw.replace(/\D/g, "");
 	if (!cpf || cpf.length !== 11) return false;
	if (/^(\d)\1{10}$/.test(cpf)) return false;

	const calc = (t: number) => {
		let sum = 0;
		for (let i = 0; i < t; i++) sum += parseInt(cpf[i]) * (t + 1 - i);
		const mod = (sum * 10) % 11;
		return mod === 10 ? 0 : mod;
	};

	const v1 = calc(9);
	const v2 = calc(10);

	return v1 === parseInt(cpf[9]) && v2 === parseInt(cpf[10]);
}

// Valida formato básico de e-mail
export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Valida data no formato DD/MM/AAAA
export function validarDataBR(date: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return false;

  const [dd, mm, yyyy] = date.split("/").map(Number);
  const d = new Date(yyyy, mm - 1, dd);

  const notInFuture = d <= new Date();
  const plausibleYear = yyyy > 1900;

  return (
    d.getFullYear() === yyyy &&
    d.getMonth() === mm - 1 &&
    d.getDate() === dd &&
    plausibleYear &&
    notInFuture
  );
}
