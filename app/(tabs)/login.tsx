import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexto/AuthContext";

const CORES = {
  bg: "#121018",
  title: "#D08BFF",
  accent: "#A78BFA",
  sub: "#8CB1D1",
  text: "#E6E6EA",
  inputBg: "#1B1924",
  inputBorder: "#2A2735",
  button: "#7C3AED",
  buttonShadow: "rgba(124, 58, 237, 0.45)",
};

export default function TelaLogin() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function fazerLogin() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert("Atenção", "Preencha e-mail e senha.");
      return;
    }

    try {
      setCarregando(true);

      const usuarioLogado = await login(email, senha);

      if (!usuarioLogado) {
        Alert.alert("Erro", "Não foi possível fazer login.");
        return;
      }

      // ✅ CORREÇÃO DEFINITIVA:
      // Apaguei o "if (autor) { ... }" que existia aqui.
      // Agora, independente do tipo, o app vai para a raiz (index).

      router.replace("/");
    } catch (err: any) {
      console.log("Erro ao tentar login:", err);
      Alert.alert("Erro", err.message || "E-mail ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  }

  function irParaCadastro() {
    router.push("/(tabs)/cadastro_cliente");
  }

  return (
    <SafeAreaView style={estilos.areaSegura}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={estilos.container}>
          <View style={estilos.cabecalho}>
            <Image
              source={require("../../assets/images/lua.png")}
              style={estilos.icone}
              resizeMode="contain"
            />
            <Text style={estilos.titulo}>Lunaris LivrarIA</Text>
            <Text style={estilos.subtitulo}>
              Publique e encontre livros facilmente
            </Text>
          </View>

          <View style={estilos.formulario}>
            <Text style={estilos.rotulo}>E-mail</Text>
            <TextInput
              placeholder="seu@email.com"
              placeholderTextColor="#8791a3"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={estilos.campoEntrada}
            />

            <Text style={[estilos.rotulo, { marginTop: 16 }]}>Senha</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#8791a3"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
              style={estilos.campoEntrada}
            />

            <TouchableOpacity
              style={[estilos.botaoPrincipal, carregando && { opacity: 0.5 }]}
              onPress={fazerLogin}
              activeOpacity={0.9}
              disabled={carregando}
            >
              <Text style={estilos.textoBotaoPrincipal}>
                {carregando ? "Entrando..." : "Entrar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={estilos.botaoSecundario}
              onPress={irParaCadastro}
              activeOpacity={0.9}
              disabled={carregando}
            >
              <Text style={estilos.textoBotaoSecundario}>Cadastrar-se</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={carregando}
              onPress={() =>
                Alert.alert(
                  "Em breve ✉",
                  "Recuperação de senha ainda não implementada."
                )
              }
            >
              <Text style={estilos.linkEsqueciSenha}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: { flex: 1, backgroundColor: CORES.bg },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cabecalho: { alignItems: "center", marginBottom: 32 },
  icone: { width: 100, height: 100, marginBottom: 8 },
  titulo: {
    color: CORES.title,
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitulo: { color: CORES.sub, textAlign: "center", fontSize: 15 },
  formulario: { width: "100%", marginTop: 16 },
  rotulo: { color: CORES.text, marginBottom: 6, fontSize: 13, opacity: 0.9 },
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
  botaoPrincipal: {
    marginTop: 22,
    backgroundColor: CORES.button,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: CORES.button,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  textoBotaoPrincipal: { color: "white", fontWeight: "700", fontSize: 16 },
  botaoSecundario: {
    marginTop: 12,
    borderColor: CORES.accent,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  textoBotaoSecundario: {
    color: CORES.accent,
    fontWeight: "600",
    fontSize: 15,
  },
  linkEsqueciSenha: {
    color: CORES.accent,
    textAlign: "center",
    marginTop: 14,
  },
});
