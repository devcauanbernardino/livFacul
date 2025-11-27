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
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexto/AuthContext";
import COLORS from "../src/constants/theme/colors";

type Pedido = {
  id: string;
  dataCompra: string;
  livro: {
    titulo: string;
    genero?: string;
    categoria?: string; // Caso use este nome
    preco: number;
    capa_url?: string;
    imagem?: string;
  };
};

export default function MeusPedidos() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function carregarPedidos() {
    if (!usuario) {
        setLoading(false);
        return;
    }

    try {
      setLoading(true);
      
      // Busca na tabela de relação, trazendo os dados do livro e a data de criação (compra)
      const { data, error } = await supabase
        .from("minha_biblioteca")
        .select(`
          id,
          created_at,
          livros (
            titulo,
            genero,
            preco,
            capa_url,
            imagem
          )
        `)
        .eq("user_id", usuario.id)
        .order("created_at", { ascending: false }); // Mais recentes primeiro

      if (error) throw error;

      // Formata os dados para facilitar a renderização
      const pedidosFormatados = data.map((item: any) => ({
        id: String(item.id),
        dataCompra: item.created_at,
        livro: item.livros
      })).filter(item => item.livro !== null);

      setPedidos(pedidosFormatados);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarPedidos();
    }, [usuario])
  );

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatarPreco = (valor: number) => {
    if (!valor && valor !== 0) return "R$ -";
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <SafeAreaView style={estilos.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={estilos.header}>
        <TouchableOpacity onPress={() => router.back()} style={estilos.btnVoltar}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={estilos.headerTitulo}>Meus Pedidos</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={estilos.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={carregarPedidos} tintColor={COLORS.accent} />
          }
          ListEmptyComponent={
            <View style={estilos.vazioContainer}>
              <Ionicons name="receipt-outline" size={64} color={COLORS.sub} />
              <Text style={estilos.textoVazio}>Você ainda não realizou nenhuma compra.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const capa = item.livro.capa_url || item.livro.imagem;
            const categoria = item.livro.genero || item.livro.categoria || "Geral";

            return (
              <View style={estilos.cardPedido}>
                {/* Capa */}
                <View style={estilos.capaContainer}>
                  {capa ? (
                    <Image source={{ uri: capa }} style={estilos.imagemCapa} resizeMode="cover" />
                  ) : (
                    <View style={estilos.semCapa}>
                      <Ionicons name="book" size={24} color={COLORS.sub} />
                    </View>
                  )}
                </View>

                {/* Informações */}
                <View style={estilos.infoContainer}>
                  <View>
                    {/* Categoria */}
                    <Text style={estilos.categoria}>{categoria.toUpperCase()}</Text>
                    
                    {/* Nome */}
                    <Text style={estilos.tituloLivro} numberOfLines={2}>
                      {item.livro.titulo}
                    </Text>

                    {/* Data */}
                    <View style={estilos.linhaData}>
                        <Ionicons name="calendar-outline" size={12} color={COLORS.sub} style={{marginRight: 4}} />
                        <Text style={estilos.dataCompra}>
                            {formatarData(item.dataCompra)}
                        </Text>
                    </View>
                  </View>

                  {/* Valor */}
                  <Text style={estilos.preco}>
                    {formatarPreco(item.livro.preco)}
                  </Text>
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

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  vazioContainer: { alignItems: "center", marginTop: 60 },
  textoVazio: { color: COLORS.sub, fontSize: 16, marginTop: 16, textAlign: 'center' },

  // Card do Pedido
  cardPedido: {
    flexDirection: "row",
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  capaContainer: {
    width: 70,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#2A2735",
    marginRight: 14,
  },
  imagemCapa: { width: "100%", height: "100%" },
  semCapa: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  infoContainer: { flex: 1, justifyContent: "space-between" },
  
  categoria: { color: COLORS.accent, fontSize: 10, fontWeight: "700", marginBottom: 4 },
  tituloLivro: { color: COLORS.text, fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  
  linhaData: { flexDirection: 'row', alignItems: 'center' },
  dataCompra: { color: COLORS.sub, fontSize: 12 },
  
  preco: { color: "#4ADE80", fontSize: 16, fontWeight: "bold", textAlign: 'right' },
});