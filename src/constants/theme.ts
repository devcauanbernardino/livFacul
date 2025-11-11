import { Platform } from "react-native";

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

export const FONTES = Platform.select({
  default: {
    semSerifa: "normal",
    serifa: "serif",
    arredondada: "normal",
    monoespacada: "monospace",
  },
  web: {
    semSerifa:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serifa: "Georgia, 'Times New Roman', serif",
    arredondada:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    monoespacada:
      "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
