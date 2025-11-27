// constants/theme/colors.ts

const corPrincipalClara = "#0a7ea4";
const corPrincipalEscura = "#fff";

export const CORES = {
  claro: {
    texto: "#11181C",
    fundo: "#fff",
    destaque: corPrincipalClara,
    icone: "#687076",
    abaIconePadrao: "#687076",
    abaIconeSelecionado: corPrincipalClara,
  },
  escuro: {
    texto: "#ECEDEE",
    fundo: "#151718",
    destaque: corPrincipalEscura,
    icone: "#9BA1A6",
    abaIconePadrao: "#9BA1A6",
    abaIconeSelecionado: corPrincipalEscura,
  },
};

// 🔥 Versão simplificada — somente Android, sem Platform, sem Web
export const FONTES = {
  semSerifa: "normal",
  serifa: "serif",
  arredondada: "normal",
  monoespacada: "monospace",
};
