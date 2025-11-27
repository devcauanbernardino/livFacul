import { useRouter } from "expo-router";
import React from "react";
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { useAuth } from "../contexto/AuthContext";
import COLORS from "../src/constants/theme/colors";

type Props = { onClose?: () => void };

function pegarIconeDivisao(divisao?: string) {
  if (divisao === "Iniciante") return "📘";
  if (divisao === "Aprendiz") return "📗";
  if (divisao === "Avançado") return "📕";
  if (divisao === "Mestre") return "🏆";
  return "📘";
}

export default function MenuLateral({ onClose }: Props) {
  const router = useRouter();
  const { usuario, logout } = useAuth();
  const logado = !!usuario;

  const avatarPadrao = require("../assets/images/icon.png");
  // Verifica se é avatarLocal (objeto {uri:...}) ou avatarUrlRemota (string)
  const avatarSource = usuario?.avatarLocal?.uri
    ? { uri: usuario.avatarLocal.uri }
    : usuario?.avatarUrlRemota
    ? { uri: usuario.avatarUrlRemota }
    : avatarPadrao;

  const progresso = logado && typeof usuario?.progressoLeitor === "number" ? usuario.progressoLeitor! : 0;
  const progressoPercent = Math.round(progresso * 100);
  const divisao = usuario?.divisao || "Iniciante";
  const divisaoIcone = pegarIconeDivisao(divisao);

  return (
    <View style={estilos.container}>
      {/* header */}
      <View style={estilos.headerWrapper}>
        <View style={estilos.topRow}>
          <View style={estilos.fotoENome}>
            <View style={estilos.fotoContainer}>
              <Image source={avatarSource} style={estilos.avatar} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={estilos.nomeUsuario}>{logado ? usuario?.nome || "Usuário" : "Bem-vindo 👋"}</Text>

              {logado && (
                <>
                  <View style={estilos.barraProgressoFundo}>
                    <View style={[estilos.barraProgressoPreenchida, { width: `${progressoPercent}%` } as ViewStyle]} />
                  </View>
                  <Text style={estilos.textoNivelLinha}>{progressoPercent}% • nível leitor</Text>
                  <View style={estilos.divisaoLinha}>
                    <Text style={estilos.iconeDivisao}>{divisaoIcone}</Text>
                    <Text style={estilos.textoDivisao}>{divisao}</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {onClose && (
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={estilos.botaoFechar}>
              <Text style={estilos.textoFechar}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={estilos.divisorHeader} />
      </View>

      {/* opções */}
      <View style={estilos.lista}>
        {logado ? (
          <>
            {/* ✅ BOTÃO EDITAR PERFIL CONECTADO */}
            
           
            <ItemMenu texto="Clube da Liv" />
            
            <ItemMenu 
              texto="Converse com a Liv" 
              extraDireita={<Text style={estilos.etiquetaIA}>🧠</Text>} 
              onPressCustom={() => {
                onClose?.();
                Linking.openURL("https://w.app/rpjf3g");
              }}
            />
            
            <ItemMenu 
              texto="Minha Biblioteca" 
              onPressCustom={() => {
                onClose?.();
                router.push("/(tabs)/biblioteca");
              }}
            />

            {usuario?.tipoUsuario === "autor" && (
              <ItemMenu
                texto="Começar a vender"
                onPressCustom={() => {
                  onClose?.();
                  router.replace("/areaAutor"); 
                }}
              />
            )}

            <ItemMenu
              texto="Sair"
              corPerigo
              onPressCustom={() => {
                logout();
                onClose?.();
                router.replace("/(tabs)/login"); // Opcional: redirecionar para login ao sair
              }}
              ultimo
            />
          </>
        ) : (
          <>
            <ItemMenu
              texto="Entrar agora"
              destaque
              onPressCustom={() => {
                onClose?.();
                router.push("/login");
              }}
            />
            <ItemMenu
              texto="Quero criar conta"
              destaqueSecundario
              onPressCustom={() => {
                onClose?.();
                router.push("/cadastro_cliente");
              }}
              ultimo
            />
          </>
        )}
      </View>
    </View>
  );
}

function ItemMenu({
  texto,
  extraDireita,
  onPressCustom,
  destaque,
  destaqueSecundario,
  corPerigo,
  ultimo,
}: {
  texto: string;
  extraDireita?: React.ReactNode;
  onPressCustom?: () => void;
  destaque?: boolean;
  destaqueSecundario?: boolean;
  corPerigo?: boolean;
  ultimo?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        estilos.itemLinha,
        destaque && estilos.itemDestaquePrimario,
        destaqueSecundario && estilos.itemDestaqueSecundario,
        corPerigo && estilos.itemPerigo,
        ultimo && { marginBottom: 0 },
      ]}
      onPress={() => (onPressCustom ? onPressCustom() : null)}
    >
      <Text
        style={[
          estilos.itemTexto,
          destaque && estilos.textoItemDestaquePrimario,
          destaqueSecundario && estilos.textoItemDestaqueSecundario,
          corPerigo && estilos.textoPerigo,
        ]}
      >
        {texto}
      </Text>
      {extraDireita ? <View>{extraDireita}</View> : null}
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 24, paddingHorizontal: 16 },
  headerWrapper: { width: "100%" },
  topRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  fotoENome: { flexDirection: "row", alignItems: "flex-start", flex: 1, paddingRight: 8 },
  fotoContainer: {
    width: 56, height: 56, borderRadius: 28, overflow: "hidden",
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.inputBorder, marginRight: 12,
  },
  avatar: { width: "100%", height: "100%", resizeMode: "cover" },
  nomeUsuario: { color: COLORS.text, fontSize: 16.5, fontWeight: "700", lineHeight: 22, flexShrink: 1 },
  barraProgressoFundo: {
    width: "100%", height: 6, backgroundColor: COLORS.inputBg, borderRadius: 999, overflow: "hidden",
    borderWidth: 1, borderColor: COLORS.inputBorder, marginTop: 8,
  },
  barraProgressoPreenchida: { height: "100%", backgroundColor: COLORS.button, borderRadius: 999 },
  textoNivelLinha: { color: COLORS.sub, fontSize: 13, fontWeight: "500", marginTop: 6 },
  divisaoLinha: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  iconeDivisao: { fontSize: 18, marginRight: 6 },
  textoDivisao: { color: COLORS.text, fontSize: 15, fontWeight: "600" },
  botaoFechar: { paddingHorizontal: 10, paddingVertical: 4, marginRight: -16 },
  textoFechar: { color: COLORS.sub, fontSize: 20, fontWeight: "600" },
  divisorHeader: { height: 1, backgroundColor: COLORS.inputBorder, marginTop: 16, marginBottom: 20 },
  lista: { flexGrow: 0 },
  itemLinha: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 16, paddingHorizontal: 16, borderRadius: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.inputBorder, marginBottom: 8,
  },
  itemTexto: { color: COLORS.text, fontSize: 16, fontWeight: "500" },
  etiquetaIA: { color: COLORS.accent, fontSize: 16, fontWeight: "700" },
  itemDestaquePrimario: { backgroundColor: COLORS.button, borderColor: COLORS.button, borderWidth: 1 },
  textoItemDestaquePrimario: { color: "white", fontWeight: "700", fontSize: 16 },
  itemDestaqueSecundario: { backgroundColor: "transparent", borderColor: COLORS.accent, borderWidth: 2 },
  textoItemDestaqueSecundario: { color: COLORS.accent, fontWeight: "600", fontSize: 16 },
  itemPerigo: { backgroundColor: "rgba(239,68,68,0.1)", borderColor: "#EF4444", borderWidth: 1 },
  textoPerigo: { color: "#EF4444", fontWeight: "700", fontSize: 16 },
});