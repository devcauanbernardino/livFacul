import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexto/AuthContext";
import COLORS from "../../src/constants/theme/colors";

type LivroBiblioteca = {
  bibliotecaId: string; // ID da tabela 'minha_biblioteca'
  id: string;
  titulo: string;
  autor: string;
  capa_url?: string;
  imagem?: string;
  pdf_url?: string;
};

export default function Biblioteca() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [livros, setLivros] = useState<LivroBiblioteca[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function carregarBiblioteca() {
    if (!usuario) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // ✅ BUSCA REAL: Pega da tabela 'minha_biblioteca' e faz join com 'livros'
      const { data, error } = await supabase
        .from("minha_biblioteca")
        .select(
          `
          id, 
          livros (
            id,
            titulo,
            autor,
            capa_url,
            pdf_url
          )
        `
        )
        .eq("user_id", usuario.id); // Filtra pelo usuário logado

      if (error) throw error;

      // Formata os dados para extrair o objeto 'livros' de dentro do array
      const livrosFormatados: LivroBiblioteca[] = data
        .map((item: any) => {
          if (!item.livros) return null;
          return {
            bibliotecaId: item.id, // ID da relação
            id: item.livros.id, // ID do livro
            ...item.livros,
          };
        })
        .filter((livro): livro is LivroBiblioteca => livro !== null);

      setLivros(livrosFormatados);
    } catch (error) {
      console.error("Erro ao carregar biblioteca:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarBiblioteca();
    }, [usuario])
  );

  const lerLivro = (livro: LivroBiblioteca) => {
    if (!livro.pdf_url) {
      alert("O arquivo PDF deste livro não está disponível.");
      return;
    }

    router.push({
      pathname: "/leitor",
      params: {
        url: livro.pdf_url,
        titulo: livro.titulo,
      },
    });
  };

  const removerLivro = (livro: LivroBiblioteca) => {
    Alert.alert(
      "Remover Livro",
      `Tem certeza que deseja remover "${livro.titulo}" da sua biblioteca? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("minha_biblioteca")
              .delete()
              .eq("id", livro.bibliotecaId); // Usa o ID da relação

            if (error) {
              Alert.alert("Erro", "Não foi possível remover o livro.");
            } else {
              // Remove o livro da lista local para atualizar a UI
              setLivros((lista) =>
                lista.filter((l) => l.bibliotecaId !== livro.bibliotecaId)
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={estilos.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={estilos.header}>
        <Text style={estilos.tituloHeader}>Minha Biblioteca 📖</Text>
        <Text style={estilos.subtituloHeader}>
          {usuario
            ? `${livros.length} livros adquiridos`
            : "Faça login para ver seus livros"}
        </Text>
      </View>

      {loading ? (
        <View style={estilos.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <FlatList
          data={livros}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={carregarBiblioteca}
              tintColor={COLORS.accent}
            />
          }
          ListEmptyComponent={
            <View style={estilos.vazioContainer}>
              <Ionicons name="library-outline" size={64} color={COLORS.sub} />
              <Text style={estilos.textoVazio}>
                {usuario
                  ? "Sua biblioteca está vazia."
                  : "Você precisa entrar para ver seus livros."}
              </Text>

              <TouchableOpacity
                style={estilos.btnExplorar}
                onPress={() => {
                  // Se não logado, vai pro login. Se logado, vai pra loja.
                  if (!usuario) router.push("/(tabs)/login");
                  else router.push("/");
                }}
              >
                <Text style={estilos.textoExplorar}>
                  {usuario ? "Ir para a Loja" : "Fazer Login"}
                </Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const capa = item.capa_url || item.imagem;
            return (
              <View style={estilos.cardLivro}>
                <View style={estilos.capaContainer}>
                  {capa ? (
                    <Image
                      source={{ uri: capa }}
                      style={estilos.imagemCapa}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={estilos.semCapa}>
                      <Ionicons name="book" size={30} color={COLORS.sub} />
                    </View>
                  )}
                </View>

                <View style={estilos.infoContainer}>
                  <View>
                    <Text style={estilos.tituloLivro} numberOfLines={2}>
                      {item.titulo}
                    </Text>
                    <Text style={estilos.autorLivro} numberOfLines={1}>
                      {item.autor}
                    </Text>
                  </View>

                  <View style={estilos.botoesContainer}>
                    <TouchableOpacity
                      style={estilos.btnRemover}
                      onPress={() => removerLivro(item)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#EF4444"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={estilos.btnLer}
                      activeOpacity={0.8}
                      onPress={() => lerLivro(item)}
                    >
                      <Ionicons name="book-outline" size={18} color="#FFF" />
                      <Text style={estilos.textoBtnLer}>Ler Agora</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2735",
  },
  tituloHeader: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
  subtituloHeader: { color: COLORS.sub, fontSize: 14, marginTop: 4 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  vazioContainer: { alignItems: "center", marginTop: 60 },
  textoVazio: {
    color: COLORS.sub,
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  btnExplorar: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  textoExplorar: { color: COLORS.accent, fontWeight: "bold" },
  cardLivro: {
    flexDirection: "row",
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  capaContainer: {
    width: 80,
    height: 110,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#2A2735",
    marginRight: 14,
  },
  imagemCapa: { width: "100%", height: "100%" },
  semCapa: { flex: 1, justifyContent: "center", alignItems: "center" },
  infoContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  tituloLivro: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  autorLivro: { color: COLORS.sub, fontSize: 14 },
  botoesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btnRemover: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  btnLer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.button,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  textoBtnLer: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
});
