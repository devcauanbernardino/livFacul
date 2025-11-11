// app/index.tsx
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SideMenu from "../../components/MenuHB";
import Avatar from "../../components/ui/Avatar";
import { useAuth } from "../../contexto/AuthContext";
import COLORS from "../../src/constants/theme/colors";

type Livro = {
  id: string;
  titulo: string;
  autor: string;
  preco: string;
  imagem?: any;
  condicao: "novo" | "usado";
};

const LIVROS_EXEMPLO: Livro[] = [
  { id: "1", titulo: "Dom Casmurro", autor: "Machado de Assis", preco: "R$ 29,90", condicao: "usado" },
  { id: "2", titulo: "Neuromancer", autor: "William Gibson", preco: "R$ 54,90", condicao: "novo" },
  { id: "3", titulo: "O Conto da Aia", autor: "Margaret Atwood", preco: "R$ 41,00", condicao: "usado" },
];

export default function PaginaMarketplace() {
  const [menuAberto, setMenuAberto] = useState(false);
  const animacao = useRef(new Animated.Value(0)).current;
  const { usuario } = useAuth();

  function abrirMenu() {
    setMenuAberto(true);
    Animated.timing(animacao, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }
  function fecharMenu() {
    Animated.timing(animacao, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setMenuAberto(false);
    });
  }

  const slideX = animacao.interpolate({ inputRange: [0, 1], outputRange: [-260, 0] });
  const larguraTela = Dimensions.get("window").width;

  // 📐 Banner menor (~40% da largura): fica ~148px de altura se width=371
  const bannerWidth = larguraTela - 40; // 20 + 20 de padding laterais
  const bannerHeight = Math.round(bannerWidth * 0.4);

  return (
    <SafeAreaView style={estilos.telaSegura}>
      <StatusBar barStyle="light-content" />

      {menuAberto && (
        <Animated.View style={[estilos.menuLateral, { transform: [{ translateX: slideX }] }]}>
          <SideMenu onClose={fecharMenu} />
        </Animated.View>
      )}
      {menuAberto && <TouchableOpacity style={estilos.fundoEscuro} activeOpacity={1} onPress={fecharMenu} />}

      {/* TOPO */}
      <View style={estilos.cabecalho}>
        <TouchableOpacity onPress={abrirMenu} style={estilos.botaoMenu} activeOpacity={0.8}>
          <View style={estilos.linhaMenu} />
          <View style={estilos.linhaMenu} />
          <View style={estilos.linhaMenu} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={estilos.textoBemVindo}>Bem-vindo</Text>
          <Text style={estilos.textoTitulo}>Explorar eBooks 📚</Text>
        </View>

        <View style={estilos.caixaAvatar}>
          <Avatar
            localUri={usuario?.avatarLocal?.uri}
            remoteUrl={usuario?.avatarUrlRemota || null}
            size={40}
          />
        </View>
      </View>

      {/* BARRA DE BUSCA (altura normal) */}
      <View style={estilos.containerBusca}>
        <TextInput
          placeholder="Buscar título, autor..."
          placeholderTextColor="#8791a3"
          style={estilos.campoBusca}
        />
      </View>

      {/* BANNER (menor) */}
      <View style={[estilos.bannerWrapper, { width: bannerWidth, height: bannerHeight }]}>
        <View style={estilos.bannerBox}>
          <Text style={estilos.bannerTitulo}>Ofertas de eBooks 🔥</Text>
          <Text style={estilos.bannerSub}>promoções, novidades e exclusivos digitais</Text>
        </View>
      </View>

      {/* CATEGORIAS (visíveis e sem cortar) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={estilos.containerCategorias}
      >
        {[
          "Ficção",
          "Romance",
          "Tecnologia",
          "Educação",
          "Autoajuda",
          "Negócios",
          "Fantasia",
          "Biografia",
        ].map((categoria) => (
          <TouchableOpacity key={categoria} style={estilos.etiquetaCategoria} activeOpacity={0.85}>
            <Text style={estilos.textoCategoria}>{categoria}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* LISTA */}
      <FlatList
        data={LIVROS_EXEMPLO}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}
        renderItem={({ item }) => (
          <View style={estilos.cartaoLivro}>
            <View style={estilos.semImagem}>
              <Text style={estilos.textoSemImagem}>Capa indisponível</Text>
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={estilos.tituloLivro} numberOfLines={1}>{item.titulo}</Text>
              <Text style={estilos.autorLivro} numberOfLines={1}>{item.autor}</Text>

              <View style={estilos.linhaPreco}>
                <Text style={estilos.precoLivro}>{item.preco}</Text>
              </View>
            </View>
          </View>
        )}
      />

      {/* BOTÃO FLUTUANTE */}
      <TouchableOpacity style={estilos.botaoVender} activeOpacity={0.9} onPress={() => console.log("Vender ebook")}>
        <Text style={estilos.textoMais}>＋</Text>
        <Text style={estilos.textoBotao}>Vender</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  telaSegura: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  menuLateral: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 260,
    backgroundColor: COLORS.bg,
    borderRightWidth: 1,
    borderRightColor: "#2A2735",
    zIndex: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  fundoEscuro: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 10 },

  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: Platform.OS === "android" ? 8 : 10,
  },
  botaoMenu: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginRight: 14,
  },
  linhaMenu: { width: "100%", height: 2, backgroundColor: COLORS.text, marginVertical: 2, borderRadius: 2 },

  textoBemVindo: { color: COLORS.sub, fontSize: 13 },
  textoTitulo: { color: COLORS.title, fontSize: 18, fontWeight: "700" },

  caixaAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginLeft: 12,
  },

  containerBusca: { paddingHorizontal: 20, marginBottom: 10 },
  campoBusca: {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    color: COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 10, // 🔹 altura normal (~44px total)
    fontSize: 15,
  },

  // Banner menor
  bannerWrapper: {
    alignSelf: "center",
    marginBottom: 10,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  bannerBox: {
    flex: 1,
    justifyContent: "flex-end",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  bannerTitulo: { color: "#fff", fontSize: 16, fontWeight: "700" },
  bannerSub: { color: "#d1d5ff", fontSize: 12, marginTop: 2 },

  // Categorias — ALTURA FIXA (não corta texto)
  containerCategorias: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 14,
    alignItems: "center",
  },
  etiquetaCategoria: {
    height: 40,                 // 🔹 altura fixa
    minWidth: 96,               // 🔹 largura mínima p/ textos maiores
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.accent,
    borderWidth: 1,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textoCategoria: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: "600",
  },

  cartaoLivro: {
    flexDirection: "row",
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  semImagem: {
    width: 64,
    height: 90,
    borderRadius: 8,
    backgroundColor: "#2A2735",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  textoSemImagem: { color: COLORS.sub, fontSize: 11, textAlign: "center" },
  tituloLivro: { color: COLORS.text, fontSize: 15, fontWeight: "600" },
  autorLivro: { color: COLORS.sub, fontSize: 13, marginTop: 2 },
  linhaPreco: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, alignItems: "center" },
  precoLivro: { color: COLORS.title, fontSize: 15, fontWeight: "700" },

  botaoVender: {
    position: "absolute",
    right: 20,
    bottom: 28,
    flexDirection: "row",
    backgroundColor: COLORS.button,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: COLORS.button,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  textoMais: { color: "white", fontSize: 20, fontWeight: "700", marginRight: 6, lineHeight: 20 },
  textoBotao: { color: "white", fontSize: 15, fontWeight: "600" },
});
