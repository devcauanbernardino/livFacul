// app/(tabs)/areaAutor.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";
import { useAuth } from "contexto/AuthContext";
import SideMenu from "../../components/MenuHB";
import CORES from "../../src/constants/theme/colors";

type Livro = {
  id: string;
  titulo: string;
  genero?: string | null;
  paginas?: number | null;
  ano?: number | null;
  preco?: number | null;
  capa_url?: string | null;
  created_at?: string | null;
};

export default function AreaAutor() {
  const { top } = useSafeAreaInsets();
  const navegar = useRouter();
  const { usuario } = useAuth();

  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [menuAberto, setMenuAberto] = useState(false);
  const animacao = useRef(new Animated.Value(0)).current;
  const slideX = animacao.interpolate({
    inputRange: [0, 1],
    outputRange: [-260, 0],
  });

  // 🔒 BLOQUEIO — somente AUTOR pode acessar
  useEffect(() => {
    if (!usuario) {
      navegar.replace("/login");
      return;
    }

    if (usuario.tipoUsuario !== "autor") {
      navegar.replace("/");
    }
  }, [usuario]);

  function abrirMenu() {
    setMenuAberto(true);
    Animated.timing(animacao, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }

  function fecharMenu() {
    Animated.timing(animacao, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setMenuAberto(false));
  }

  async function carregarLivros() {
    if (!usuario?.id) return;

    try {
      setCarregando(true);

      const { data } = await supabase
        .from("livros")
        .select("id, titulo, genero, paginas, ano, preco, capa_url, created_at")
        .eq("autor_id", usuario.id)
        .order("created_at", { ascending: false });

      if (data) setLivros(data as Livro[]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarLivros();
  }, [usuario?.id]);

  const totalPaginas = livros.reduce((acc, l) => acc + (l.paginas || 0), 0);
  const larguraTela = Dimensions.get("window").width;
  const blocoWidth = Math.min(larguraTela - 40, 520);

  return (
    <SafeAreaView style={[estilos.telaSegura, { paddingTop: top }]}>
      <StatusBar barStyle="light-content" />

      {menuAberto && (
        <Animated.View
          style={[estilos.menuLateral, { transform: [{ translateX: slideX }] }]}
        >
          <SideMenu onClose={fecharMenu} />
        </Animated.View>
      )}

      {menuAberto && (
        <TouchableOpacity
          style={estilos.fundoEscuro}
          activeOpacity={1}
          onPress={fecharMenu}
        />
      )}

      <View style={estilos.cabecalho}>
        <TouchableOpacity
          onPress={abrirMenu}
          style={estilos.botaoMenu}
          activeOpacity={0.8}
        >
          <View style={estilos.linhaMenu} />
          <View style={estilos.linhaMenu} />
          <View style={estilos.linhaMenu} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={estilos.textoBemVindo}>Autor</Text>
          <Text style={estilos.textoTitulo}>Área do autor ✍️</Text>
        </View>
      </View>

      <View style={[estilos.conteudo, { width: blocoWidth }]}>
        <View style={estilos.linhaCards}>
          <View style={estilos.cardResumo}>
            <Text style={estilos.cardLabel}>Livros publicados</Text>
            <Text style={estilos.cardValor}>{livros.length}</Text>
          </View>
          <View style={estilos.cardResumo}>
            <Text style={estilos.cardLabel}>Páginas totais</Text>
            <Text style={estilos.cardValor}>{totalPaginas}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={estilos.botaoPrincipal}
          activeOpacity={0.9}
          onPress={() => navegar.push("/cadastroLivro")}
        >
          <Text style={estilos.textoBotaoPrincipal}>
            + Cadastrar novo livro
          </Text>
        </TouchableOpacity>

        <View style={estilos.blocoLista}>
          <Text style={estilos.tituloSecao}>Seu catálogo</Text>

          {carregando ? (
            <ActivityIndicator
              size="small"
              color={CORES.accent}
              style={{ marginTop: 16 }}
            />
          ) : livros.length === 0 ? (
            <Text style={estilos.textoVazio}>
              Você ainda não cadastrou nenhum livro.
            </Text>
          ) : (
            <FlatList
              data={livros}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              renderItem={({ item }) => (
                <View style={estilos.itemLivro}>
                  {item.capa_url ? (
                    <Image
                      source={{ uri: item.capa_url }}
                      style={estilos.capaLivro}
                    />
                  ) : (
                    <View style={estilos.capaPlaceholder}>
                      <Text style={estilos.capaPlaceholderTexto}>📚</Text>
                    </View>
                  )}

                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={estilos.tituloLivro} numberOfLines={1}>
                      {item.titulo}
                    </Text>

                    <Text style={estilos.infoLivro}>
                      {item.genero || "Sem gênero"}
                    </Text>

                    <Text style={estilos.infoLivroSecundaria}>
                      {item.paginas ? `${item.paginas} pág.` : "Páginas n/d"}{" "}
                      {item.ano ? `• ${item.ano}` : ""}
                    </Text>

                    <Text style={estilos.precoLivro}>
                      {item.preco
                        ? `R$ ${item.preco.toFixed(2)}`
                        : "Preço não informado"}
                    </Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  telaSegura: { flex: 1, backgroundColor: CORES.bg },

  menuLateral: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 260,
    backgroundColor: CORES.bg,
    borderRightWidth: 1,
    borderRightColor: "#2A2735",
    zIndex: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  fundoEscuro: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 10,
  },

  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 8,
  },
  botaoMenu: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CORES.inputBorder,
    backgroundColor: CORES.inputBg,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginRight: 14,
  },
  linhaMenu: {
    width: "100%",
    height: 2,
    backgroundColor: CORES.text,
    marginVertical: 2,
    borderRadius: 2,
  },
  textoBemVindo: { color: CORES.sub, fontSize: 13 },
  textoTitulo: { color: CORES.title, fontSize: 18, fontWeight: "700" },

  conteudo: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  linhaCards: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    marginBottom: 16,
  },
  cardResumo: {
    flex: 1,
    backgroundColor: CORES.inputBg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: CORES.inputBorder,
  },
  cardLabel: { color: CORES.sub, fontSize: 12 },
  cardValor: { color: CORES.text, fontSize: 20, fontWeight: "700", marginTop: 4 },

  botaoPrincipal: {
    backgroundColor: CORES.button,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  textoBotaoPrincipal: { color: "white", fontWeight: "700", fontSize: 15 },

  blocoLista: {
    backgroundColor: CORES.inputBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: CORES.inputBorder,
    marginBottom: 20,
  },
  tituloSecao: { color: CORES.text, fontSize: 16, fontWeight: "600", marginBottom: 8 },
  textoVazio: { color: CORES.sub, fontSize: 13, marginTop: 4 },

  itemLivro: {
    flexDirection: "row",
    backgroundColor: "#00000020",
    borderRadius: 10,
    padding: 10,
    alignItems: "flex-start",
  },

  capaLivro: {
    width: 55,
    height: 80,
    borderRadius: 6,
    backgroundColor: "#222",
  },
  capaPlaceholder: {
    width: 55,
    height: 80,
    borderRadius: 6,
    backgroundColor: "#1E1A2B",
    alignItems: "center",
    justifyContent: "center",
  },
  capaPlaceholderTexto: { fontSize: 22 },

  tituloLivro: { color: CORES.text, fontSize: 15, fontWeight: "600" },
  infoLivro: { color: CORES.sub, fontSize: 12, marginTop: 2 },
  infoLivroSecundaria: { color: CORES.sub, fontSize: 11, marginTop: 2 },
  precoLivro: { color: CORES.accent, fontSize: 14, fontWeight: "700", marginTop: 4 },
});
