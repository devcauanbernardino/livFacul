import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexto/AuthContext";
import { useCarrinho } from "../contexto/CarrinhoContext";
import COLORS from "../src/constants/theme/colors";

export default function DetalhesLivro() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { adicionarItem } = useCarrinho();
  const { usuario } = useAuth();

  // ✅ BLOQUEIO DE ACESSO PARA NÃO LOGADOS
  useEffect(() => {
    if (!usuario) {
      Alert.alert(
        "🔒 Acesso Restrito",
        "Você precisa estar logado para ver os detalhes deste livro.",
        [
          { 
            text: "Voltar", 
            style: "cancel", 
            onPress: () => router.back() 
          },
          { 
            text: "Fazer Login", 
            onPress: () => router.push("/(tabs)/login") 
          }
        ]
      );
    }
  }, [usuario]);

  // Se não estiver logado, não renderiza nada (fica uma tela vazia até o usuário decidir no Alert)
  if (!usuario) {
    return <View style={{ flex: 1, backgroundColor: COLORS.bg }} />;
  }

  const {
    id,
    titulo,
    autor,
    preco,
    capa_url,
    imagem,
    genero,
    categoria,
    descricao,
    sinopse,
    editora,
    ano,
    paginas,
  } = params;

  const imagemFinal = (capa_url as string) || (imagem as string);
  const generoFinal = (genero as string) || (categoria as string);
  const descricaoFinal = (sinopse as string) || (descricao as string) || "Nenhuma descrição fornecida para este livro.";
  
  const precoNumerico = Number(preco || 0);
  const precoFormatado = formatarPreco(precoNumerico);

  function formatarPreco(valor: number) {
    if (!valor || valor === 0) return "Grátis";
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function handleComprar() {
    // Adiciona e vai direto para o checkout
    adicionarItem({
      id: id as string,
      titulo: titulo as string,
      autor: autor as string,
      preco: precoNumerico,
      imagem: imagemFinal,
    });

    router.push({
      pathname: "/finalizarCompra",
      params: { total: precoNumerico }
    });
  }

  function handleAdicionarCarrinho() {
    adicionarItem({
      id: id as string,
      titulo: titulo as string,
      autor: autor as string,
      preco: precoNumerico,
      imagem: imagemFinal,
    });
  }

  return (
    <SafeAreaView style={estilos.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={estilos.header}>
        <TouchableOpacity onPress={() => router.back()} style={estilos.btnVoltar}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={estilos.headerTitulo} numberOfLines={1}>Detalhes</Text>
        
        <TouchableOpacity onPress={() => router.push("/carrinho")} style={estilos.btnVoltar}>
            <Ionicons name="cart-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={estilos.scrollContent}>
        <View style={estilos.topoDetalhes}>
          <View style={estilos.capaWrapper}>
            {imagemFinal ? (
              <Image source={{ uri: imagemFinal }} style={estilos.capaImagem} resizeMode="cover" />
            ) : (
              <View style={estilos.capaPlaceholder}>
                <Ionicons name="book-outline" size={40} color={COLORS.sub} />
                <Text style={estilos.textoSemCapa}>Sem Capa</Text>
              </View>
            )}
          </View>

          <View style={estilos.infoPrincipal}>
            <Text style={estilos.titulo}>{titulo}</Text>
            <Text style={estilos.autor}>{autor}</Text>
            
            {generoFinal && (
               <View style={estilos.badgeGenero}>
                 <Text style={estilos.textoGenero}>{generoFinal.toUpperCase()}</Text>
               </View>
            )}

            <Text style={estilos.preco}>{precoFormatado}</Text>
          </View>
        </View>

        <View style={estilos.gridInfo}>
          <View style={estilos.itemInfo}>
            <Text style={estilos.labelInfo}>Editora</Text>
            <Text style={estilos.valorInfo}>{editora || "-"}</Text>
          </View>
          <View style={estilos.itemInfo}>
            <Text style={estilos.labelInfo}>Ano</Text>
            <Text style={estilos.valorInfo}>{ano || "-"}</Text>
          </View>
          <View style={estilos.itemInfo}>
            <Text style={estilos.labelInfo}>Páginas</Text>
            <Text style={estilos.valorInfo}>{paginas || "-"}</Text>
          </View>
        </View>

        <View style={estilos.secaoSinopse}>
          <Text style={estilos.tituloSecao}>Sinopse</Text>
          <Text style={estilos.textoSinopse}>{descricaoFinal}</Text>
        </View>
      </ScrollView>

      <View style={estilos.footer}>
        <TouchableOpacity style={estilos.btnCarrinho} onPress={handleAdicionarCarrinho}>
          <Ionicons name="cart-outline" size={24} color={COLORS.accent} />
        </TouchableOpacity>

        <TouchableOpacity style={estilos.btnComprar} onPress={handleComprar}>
          <Text style={estilos.textoBtnComprar}>Comprar Agora</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#2A2735" },
  btnVoltar: { padding: 8, borderRadius: 8, backgroundColor: COLORS.inputBg },
  headerTitulo: { color: COLORS.text, fontSize: 18, fontWeight: "bold" },
  scrollContent: { paddingBottom: 120 },
  topoDetalhes: { flexDirection: "row", padding: 20 },
  capaWrapper: { width: 120, height: 180, borderRadius: 12, overflow: "hidden", backgroundColor: "#2A2735", elevation: 5 },
  capaImagem: { width: "100%", height: "100%" },
  capaPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  textoSemCapa: { color: COLORS.sub, fontSize: 12, marginTop: 4 },
  infoPrincipal: { flex: 1, marginLeft: 16, justifyContent: "center" },
  titulo: { color: "#FFF", fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  autor: { color: COLORS.sub, fontSize: 16, marginBottom: 12 },
  badgeGenero: { backgroundColor: "rgba(167, 139, 250, 0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: "flex-start", marginBottom: 12 },
  textoGenero: { color: COLORS.accent, fontSize: 12, fontWeight: "bold" },
  preco: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
  gridInfo: { flexDirection: "row", justifyContent: "space-around", backgroundColor: COLORS.inputBg, marginHorizontal: 20, borderRadius: 12, padding: 16, marginBottom: 24 },
  itemInfo: { alignItems: "center", flex: 1 },
  labelInfo: { color: COLORS.sub, fontSize: 12, marginBottom: 4 },
  valorInfo: { color: COLORS.text, fontSize: 14, fontWeight: "600", textAlign: "center" },
  secaoSinopse: { paddingHorizontal: 20 },
  tituloSecao: { color: COLORS.title, fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  textoSinopse: { color: "#E6E6EA", fontSize: 15, lineHeight: 24, opacity: 0.9 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: COLORS.inputBg, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, borderTopWidth: 1, borderTopColor: "#2A2735", flexDirection: "row", alignItems: "center" },
  btnCarrinho: { width: 50, height: 50, borderRadius: 12, borderWidth: 1, borderColor: COLORS.accent, justifyContent: "center", alignItems: "center", marginRight: 12 },
  btnComprar: { flex: 1, backgroundColor: COLORS.button, height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center", elevation: 4 },
  textoBtnComprar: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});