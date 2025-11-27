import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from "../../src/constants/theme/colors";

type Livro = {
  id: string;
  titulo: string;
  autor: string;
  preco: string | number;
  capa_url?: string;
  genero?: string;
  condicao?: "novo" | "usado";
  descricao?: string;
  sinopse?: string;
  editora?: string;
  ano?: string | number;
  paginas?: string | number;
  imagem?: string;
  categoria?: string;
};

export default function PaginaCategoria() {
  const router = useRouter();
  // O "nome" vem do nome do arquivo [nome].tsx
  const { nome } = useLocalSearchParams();
  
  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregando, setCarregando] = useState(true);

  const nomeCategoria = (nome as string) || "Categoria";

  useEffect(() => {
    buscarLivrosPorCategoria();
  }, [nome]);

  async function buscarLivrosPorCategoria() {
    try {
      setCarregando(true);
      // Busca livros onde a coluna 'genero' (ou categoria) contenha o nome da rota
      // Usamos ilike para ignorar maiúsculas/minúsculas (ex: "ficção" acha "Ficção")
      const { data, error } = await supabase
        .from("livros")
        .select("*")
        .ilike("genero", `%${nomeCategoria}%`); 

      if (error) {
        console.error("Erro ao buscar categoria:", error);
      } else {
        setLivros(data || []);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setCarregando(false);
    }
  }

  const formatarPreco = (valor: string | number) => {
    if (!valor || valor === "0") return "Grátis";
    const numero = Number(valor);
    if (isNaN(numero)) return valor.toString();
    return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

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
    <SafeAreaView style={estilos.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      
      {/* Header */}
      <View style={estilos.header}>
        <TouchableOpacity onPress={() => router.back()} style={estilos.btnVoltar}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={estilos.headerTitulo} numberOfLines={1}>
          {nomeCategoria}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {carregando ? (
        <View style={estilos.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <FlatList
          data={livros}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <View style={estilos.emptyContainer}>
              <Ionicons name="library-outline" size={60} color={COLORS.sub} />
              <Text style={estilos.emptyText}>Nenhum livro encontrado em "{nomeCategoria}".</Text>
            </View>
          }
          renderItem={({ item }) => {
            const imagemFinal = item.capa_url || item.imagem;
            const condicaoFinal = item.condicao;

            return (
              <TouchableOpacity activeOpacity={0.9} onPress={() => abrirDetalhes(item)}>
                <View style={estilos.cartaoLivro}>
                  <View style={estilos.capaContainer}>
                    {imagemFinal ? (
                      <Image source={{ uri: imagemFinal }} style={estilos.imagemCapa} resizeMode="cover" />
                    ) : (
                      <View style={estilos.semImagem}>
                        <Text style={estilos.textoSemImagem}>Sem Capa</Text>
                      </View>
                    )}
                  </View>

                  <View style={estilos.infoContainer}>
                    <Text style={estilos.tituloLivro} numberOfLines={2}>
                      {item.titulo}
                    </Text>
                    <Text style={estilos.autorLivro} numberOfLines={1}>
                      {item.autor}
                    </Text>

                    <View style={estilos.linhaPreco}>
                      <Text style={estilos.precoLivro}>{formatarPreco(item.preco)}</Text>
                      {condicaoFinal && (
                        <View style={[
                            estilos.tagCondicao, 
                            { backgroundColor: condicaoFinal === 'novo' ? '#4ADE8020' : '#FACC1520' }
                        ]}>
                            <Text style={[
                                estilos.textoCondicao,
                                { color: condicaoFinal === 'novo' ? '#4ADE80' : '#FACC15' }
                            ]}>
                                {condicaoFinal.toUpperCase()}
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
      )}
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
  headerTitulo: { color: COLORS.text, fontSize: 18, fontWeight: "bold", textTransform: "capitalize" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: { color: COLORS.sub, marginTop: 16, fontSize: 16, textAlign: "center" },
  
  // Cartão (reutilizado do index)
  cartaoLivro: {
    flexDirection: "row",
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
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
  semImagem: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
  textoSemImagem: { color: COLORS.sub, fontSize: 10 },
  infoContainer: { flex: 1, justifyContent: "space-between" },
  tituloLivro: { color: COLORS.text, fontSize: 16, fontWeight: "700", marginBottom: 2 },
  autorLivro: { color: COLORS.sub, fontSize: 13, marginBottom: 6 },
  linhaPreco: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  precoLivro: { color: COLORS.title, fontSize: 16, fontWeight: "700" },
  tagCondicao: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  textoCondicao: { fontSize: 10, fontWeight: "700" },
});