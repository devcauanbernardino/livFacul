import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CORES from "../src/constants/theme/colors";

type ForcaSenhaProps = {
  pwd: {
    pontuacao: number;
    requisitos: {
      tamanho: boolean;
      maiuscula: boolean;
      numero: boolean;
      especial: boolean;
    };
  };
};

function rotuloForca(pontuacao: number) {
  switch (pontuacao) {
    case 0:
      return "Muito fraca";
    case 1:
      return "Fraca";
    case 2:
      return "Média";
    case 3:
      return "Forte";
    default:
      return "Muito forte";
  }
}

export default function ForcaSenha({ pwd }: ForcaSenhaProps) {
  if (!pwd) return null;

  return (
    <View style={estilos.container}>
      <Text style={estilos.texto}>
        Força: <Text style={estilos.valor}>{rotuloForca(pwd.pontuacao)}</Text>
      </Text>

      <View style={estilos.barras}>
        <View
          style={[
            estilos.barra,
            pwd.pontuacao >= 1 && estilos.fraca,
          ]}
        />
        <View
          style={[
            estilos.barra,
            pwd.pontuacao >= 2 && estilos.media,
          ]}
        />
        <View
          style={[
            estilos.barra,
            pwd.pontuacao >= 3 && estilos.forte,
          ]}
        />
        <View
          style={[
            estilos.barra,
            pwd.pontuacao >= 4 && estilos.muitoForte,
          ]}
        />
      </View>

      <Text style={estilos.titulo}>Requisitos:</Text>
      <Text style={estilos.linha}>
        • Mínimo 8 caracteres:{" "}
        <Text style={pwd.requisitos.tamanho ? estilos.ok : estilos.naoOk}>
          {pwd.requisitos.tamanho ? "OK" : "—"}
        </Text>
      </Text>
      <Text style={estilos.linha}>
        • Letra maiúscula:{" "}
        <Text style={pwd.requisitos.maiuscula ? estilos.ok : estilos.naoOk}>
          {pwd.requisitos.maiuscula ? "OK" : "—"}
        </Text>
      </Text>
      <Text style={estilos.linha}>
        • Número:{" "}
        <Text style={pwd.requisitos.numero ? estilos.ok : estilos.naoOk}>
          {pwd.requisitos.numero ? "OK" : "—"}
        </Text>
      </Text>
      <Text style={estilos.linha}>
        • Caractere especial:{" "}
        <Text style={pwd.requisitos.especial ? estilos.ok : estilos.naoOk}>
          {pwd.requisitos.especial ? "OK" : "—"}
        </Text>
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    borderLeftWidth: 3,
    borderColor: "#A78BFA",
    paddingLeft: 12,
    paddingVertical: 10,
    marginTop: 6,
    marginBottom: 16,
  },

  texto: { 
    color: CORES.text, 
    fontSize: 13, 
    fontWeight: "500", 
    marginBottom: 6 
  },

  valor: {
    color: CORES.text,
    fontWeight: "700",
  },

  barras: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 10 
  },

  barra: {
    flex: 1,
    height: 5,
    backgroundColor: "#2c2838",
    borderRadius: 4,
    marginRight: 4,
  },

  fraca: {
    backgroundColor: "#FF6B6B",
  },

  media: { 
    backgroundColor: "#F59E0B",
  },

  forte: { 
    backgroundColor: "#10B981",
  },

  muitoForte: { 
    backgroundColor: "#34D399",
  },

  titulo: { 
    color: CORES.text, 
    fontSize: 13, 
    fontWeight: "700", 
    marginBottom: 4 
  },

  linha: { 
    color: CORES.text, 
    fontSize: 12, 
    lineHeight: 18, 
    marginBottom: 2 
  },

  ok: {
    color: CORES.success, 
    fontWeight: "700",
  },

  naoOk: { 
    color: CORES.danger, 
    fontWeight: "700",
  },
});
