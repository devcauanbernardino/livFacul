import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import CORES from "../src/constants/theme/colors";

type Props = {
  rotulo: string;
  valor: string;
  aoAlterarTexto: (texto: string) => void;
  placeholder?: string;
  tipoTeclado?: any;
  senhaOculta?: boolean;
  aoPerderFoco?: () => void;
  aoFocar?: () => void;
  erro?: string | null;
  autoCapitalizar?: "none" | "sentences" | "words" | "characters";
};

export default function CampoTextoPadrao({
  rotulo,
  valor,
  aoAlterarTexto,
  placeholder,
  tipoTeclado,
  senhaOculta,
  aoPerderFoco,
  aoFocar,
  erro,
  autoCapitalizar = "none",
}: Props) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={estilos.rotulo}>{rotulo}</Text>

      <TextInput
        style={[
          estilos.campoEntrada,
          erro ? { borderColor: CORES.danger } : null,
        ]}
        value={valor}
        onChangeText={aoAlterarTexto}
        placeholder={placeholder}
        placeholderTextColor="#777"
        keyboardType={tipoTeclado}
        secureTextEntry={senhaOculta}
        onBlur={aoPerderFoco}
        onFocus={aoFocar}
        autoCapitalize={autoCapitalizar}
      />

      {erro ? <Text style={estilos.textoErro}>{erro}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  rotulo: {
    color: CORES.text,
    marginBottom: 6,
    fontSize: 13,
    opacity: 0.9,
  },
  campoEntrada: {
    backgroundColor: CORES.inputBg,
    borderColor: CORES.inputBorder,
    borderWidth: 1,
    color: CORES.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
  },
  textoErro: {
    color: CORES.danger,
    fontSize: 12,
    marginTop: 6,
  },
});
