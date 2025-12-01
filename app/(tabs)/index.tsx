import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";
import SideMenu from "../../components/MenuHB";
import Avatar from "../../components/ui/Avatar";
import { useAuth } from "../../contexto/AuthContext";
import COLORS from "../../src/constants/theme/colors";

type Livro = {
  id: string;
  titulo: string;
  autor: string;
  preco: string | number;
  capa_url?: string;
  genero?: string;
  condicao?: "novo" | "usado";
  descricao?: string; // ou sinopse
  sinopse?: string;
  editora?: string;
  ano?: string | number;
  paginas?: string | number;
  imagem?: string;
  categoria?: string;
};

export default function PaginaMarketplace() {
  const router = useRouter();
  const { usuario } = useAuth();

  const [menuAberto, setMenuAberto] = useState(false);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [termoBusca, setTermoBusca] = useState("");

  const animacao = useRef(new Animated.Value(0)).current;

  async function buscarLivros() {
    try {
      const { data, error } = await supabase
        .from("livros")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar livros:", error);
      } else {
        setLivros(data || []);
      }
    } catch (err) {
      console.error("Erro de conexão:", err);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      buscarLivros();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    buscarLivros();
  };

  const livrosFiltrados = livros.filter((livro) => {
    const termo = termoBusca.toLowerCase();
    const titulo = livro.titulo?.toLowerCase() || "";
    const autor = livro.autor?.toLowerCase() || "";

    return titulo.includes(termo) || autor.includes(termo);
  });

  // Funções do Menu
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
    }).start(() => {
      setMenuAberto(false);
    });
  }

  const slideX = animacao.interpolate({
    inputRange: [0, 1],
    outputRange: [-260, 0],
  });
  const larguraTela = Dimensions.get("window").width;
  const bannerWidth = larguraTela - 40;
  const bannerHeight = Math.round(bannerWidth * 0.4);
  const ehAutor = usuario?.tipoUsuario === "autor";

  const formatarPreco = (valor: string | number) => {
    if (valor === 0 || valor === "0") return "Grátis";
    if (!valor) return "Grátis";
    const numero = Number(valor);
    if (isNaN(numero)) return valor.toString();
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Função para navegar aos detalhes
  const abrirDetalhes = (livro: Livro) => {
    router.push({
      pathname: "/detalhesLivro",
      params: {
        id: livro.id,
        titulo: livro.titulo,
        autor: livro.autor,
        preco: livro.preco,
        capa_url: livro.capa_url || livro.imagem,
        genero: livro.genero || livro.categoria,
        condicao: livro.condicao,
        descricao: livro.descricao,
        sinopse: livro.sinopse,
        editora: livro.editora,
        ano: livro.ano,
        paginas: livro.paginas,
      },
    });
  };

  return (
    <SafeAreaView style={estilos.telaSegura}>
      <StatusBar barStyle="light-content" />

      {/* Menu Lateral */}
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

      {/* Topo */}
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
          <Text style={estilos.textoBemVindo}>
            Olá, {usuario?.nome || "Visitante"}
          </Text>
          <Text style={estilos.textoTitulo}>Explorar eBooks 📚</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/EditarPerfil")}
          activeOpacity={0.8}
        >
          <Avatar
            localUri={usuario?.avatarLocal?.uri}
            remoteUrl={usuario?.avatarUrlRemota || null}
            size={40}
          />
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={estilos.containerBusca}>
        <TextInput
          placeholder="Buscar título, autor..."
          placeholderTextColor="#8791a3"
          style={estilos.campoBusca}
          value={termoBusca}
          onChangeText={setTermoBusca}
        />
      </View>

      <FlatList
        data={livrosFiltrados}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
          />
        }
        ListHeaderComponent={
          <>
            {termoBusca.length === 0 && (
              <>
                <View
                  style={[
                    estilos.bannerWrapper,
                    { width: bannerWidth, height: bannerHeight },
                  ]}
                >
                  <Image
                    source={require("assets/images/banner/banner.png")}
                    style={estilos.bannerImagem}
                    resizeMode="cover"
                  />

                  <View style={estilos.bannerBox}>
                    <Text style={estilos.bannerTitulo}>
                      Ofertas de eBooks 🔥
                    </Text>
                    <Text style={estilos.bannerSub}>
                      promoções, novidades e exclusivos digitais
                    </Text>
                  </View>
                </View>

                {/* --- LISTA DE CATEGORIAS ATUALIZADA --- */}
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
                    <TouchableOpacity
                      key={categoria}
                      style={estilos.etiquetaCategoria}
                      activeOpacity={0.85}
                      // ✅ NAVEGAÇÃO ADICIONADA AQUI:
                      onPress={() => router.push(`/categoria/${categoria}`)}
                    >
                      <Text style={estilos.textoCategoria}>{categoria}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 18,
                    fontWeight: "bold",
                    marginLeft: 20,
                    marginBottom: 10,
                  }}
                >
                  Recentes
                </Text>
              </>
            )}
            {termoBusca.length > 0 && (
              <Text
                style={{
                  color: COLORS.sub,
                  fontSize: 14,
                  marginLeft: 20,
                  marginBottom: 10,
                }}
              >
                Resultados para "{termoBusca}"
              </Text>
            )}
          </>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          !carregando ? (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Text style={{ color: COLORS.sub }}>
                {termoBusca
                  ? "Nenhum livro encontrado com esse termo."
                  : "Nenhum livro cadastrado."}
              </Text>
            </View>
          ) : (
            <ActivityIndicator
              size="large"
              color={COLORS.accent}
              style={{ marginTop: 40 }}
            />
          )
        }
        renderItem={({ item }) => {
          const imagemFinal = item.capa_url || item.imagem;
          const categoriaFinal = item.genero || item.categoria;

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => abrirDetalhes(item)}
            >
              <View style={estilos.cartaoLivro}>
                <View style={estilos.capaContainer}>
                  {imagemFinal ? (
                    <Image
                      source={{ uri: imagemFinal }}
                      style={estilos.imagemCapa}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={estilos.semImagem}>
                      <Text style={estilos.textoSemImagem}>Sem Capa</Text>
                    </View>
                  )}
                </View>

                <View style={estilos.infoContainer}>
                  {categoriaFinal && (
                    <Text style={estilos.categoriaLivro}>
                      {categoriaFinal.toUpperCase()}
                    </Text>
                  )}

                  <Text style={estilos.tituloLivro} numberOfLines={2}>
                    {item.titulo}
                  </Text>

                  <Text style={estilos.autorLivro} numberOfLines={1}>
                    {item.autor}
                  </Text>

                  <View style={estilos.linhaPreco}>
                    <Text style={estilos.precoLivro}>
                      {formatarPreco(item.preco)}
                    </Text>

                    {item.condicao && (
                      <View
                        style={[
                          estilos.tagCondicao,
                          {
                            backgroundColor:
                              item.condicao === "novo"
                                ? "#4ADE8020"
                                : "#FACC1520",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            estilos.textoCondicao,
                            {
                              color:
                                item.condicao === "novo"
                                  ? "#4ADE80"
                                  : "#FACC15",
                            },
                          ]}
                        >
                          {item.condicao.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {ehAutor && (
        <TouchableOpacity
          style={estilos.botaoVender}
          activeOpacity={0.9}
          onPress={() => router.push("/(tabs)/areaAutor")}
        >
          <Text style={estilos.textoMais}>＋</Text>
          <Text style={estilos.textoBotao}>Vender</Text>
        </TouchableOpacity> 
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  bannerImagem: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 12, // opcional
  },
  telaSegura: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: StatusBar.currentHeight || 0,
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
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginRight: 14,
  },
  linhaMenu: {
    width: "100%",
    height: 2,
    backgroundColor: COLORS.text,
    marginVertical: 2,
    borderRadius: 2,
  },
  textoBemVindo: { color: COLORS.sub, fontSize: 13 },
  textoTitulo: { color: COLORS.title, fontSize: 18, fontWeight: "700" },
  // caixaAvatar: { width: 40, height: 40, borderRadius: 20, overflow: "hidden", backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.inputBorder, marginLeft: 12 },
  containerBusca: { paddingHorizontal: 20, marginBottom: 10 },
  campoBusca: {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    color: COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  bannerWrapper: {
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginTop: 10,
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
  containerCategorias: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 20,
  },
  etiquetaCategoria: {
    height: 40,
    minWidth: 96,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.accent,
    borderWidth: 1,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textoCategoria: { color: COLORS.accent, fontSize: 14, fontWeight: "600" },

  cartaoLivro: {
    flexDirection: "row",
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  capaContainer: {
    width: 80,
    height: 110,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#2A2735",
    marginRight: 12,
  },
  imagemCapa: { width: "100%", height: "100%" },
  semImagem: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  textoSemImagem: { color: COLORS.sub, fontSize: 10, textAlign: "center" },

  infoContainer: { flex: 1, justifyContent: "space-between" },
  categoriaLivro: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 2,
  },
  tituloLivro: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  autorLivro: { color: COLORS.sub, fontSize: 13, marginBottom: 6 },

  linhaPreco: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  precoLivro: { color: COLORS.title, fontSize: 16, fontWeight: "700" },
  tagCondicao: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  textoCondicao: { fontSize: 10, fontWeight: "700" },

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
    elevation: 6,
    shadowColor: COLORS.button,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  textoMais: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginRight: 6,
    lineHeight: 22,
  },
  textoBotao: { color: "white", fontSize: 15, fontWeight: "600" },
});
