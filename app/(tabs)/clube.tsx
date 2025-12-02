import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../../src/constants/theme/colors";

export default function ClubeDoLivro() {
  const router = useRouter();

  return (
    <SafeAreaView style={estilos.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={estilos.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={estilos.btnVoltar}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={estilos.headerTitulo}>Clube da Liv</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={estilos.content}>
        <Ionicons
          name="people-circle-outline"
          size={80}
          color={COLORS.accent}
        />
        <Text style={estilos.titulo}>Bem-vindo ao Clube!</Text>
        <Text style={estilos.subtitulo}>
          Em breve, você encontrará aqui discussões, recomendações e eventos
          exclusivos para membros.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2735",
  },
  btnVoltar: { padding: 8, borderRadius: 8, backgroundColor: COLORS.inputBg },
  headerTitulo: { color: COLORS.text, fontSize: 18, fontWeight: "bold" },
  content: {
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  titulo: {
    color: COLORS.title,
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitulo: {
    color: COLORS.sub,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
