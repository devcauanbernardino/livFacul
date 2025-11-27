import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCarrinho } from "../contexto/CarrinhoContext"; // Importante: usa o contexto global
import COLORS from "../src/constants/theme/colors";

export default function Carrinho() {
  const router = useRouter();
  
  // Usando os dados reais do contexto
  const { itens, removerItem, total } = useCarrinho();

  const formatarPreco = (valor: number) => {
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
        <Text style={estilos.headerTitulo}>Meu Carrinho</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Lista de Itens */}
      <FlatList
        data={itens}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={estilos.vazioContainer}>
            <Ionicons name="cart-outline" size={64} color={COLORS.sub} />
            <Text style={estilos.vazioTexto}>Seu carrinho está vazio.</Text>
            <TouchableOpacity style={estilos.btnExplorar} onPress={() => router.replace("/(tabs)/index")}>
              <Text style={estilos.textoExplorar}>Explorar Livros</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={estilos.itemContainer}>
            <Image 
                source={item.imagem ? { uri: item.imagem } : undefined} 
                style={estilos.itemImagem} 
                resizeMode="cover" 
            />
            <View style={estilos.itemInfo}>
              <Text style={estilos.itemTitulo} numberOfLines={2}>{item.titulo}</Text>
              <Text style={estilos.itemAutor} numberOfLines={1}>{item.autor}</Text>
              <Text style={estilos.itemPreco}>{formatarPreco(item.preco)}</Text>
            </View>
            <TouchableOpacity onPress={() => removerItem(item.id)} style={estilos.btnRemover}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Footer (só aparece se tiver itens) */}
      {itens.length > 0 && (
        <View style={estilos.footer}>
          <View style={estilos.linhaTotal}>
            <Text style={estilos.labelTotal}>Total</Text>
            <Text style={estilos.valorTotal}>{formatarPreco(total)}</Text>
          </View>

          <TouchableOpacity
            style={estilos.btnFinalizar}
            onPress={() => router.push({
                pathname: "/finalizarCompra",
                params: { total: total.toFixed(2) }
            })}
          >
            <Text style={estilos.textoBtnFinalizar}>Fechar Pedido</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#2A2735" },
  btnVoltar: { padding: 8, borderRadius: 8, backgroundColor: COLORS.inputBg },
  headerTitulo: { color: COLORS.text, fontSize: 18, fontWeight: "bold" },
  
  vazioContainer: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  vazioTexto: { color: COLORS.sub, fontSize: 16, marginTop: 16, marginBottom: 24 },
  btnExplorar: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.inputBg, borderRadius: 12, borderWidth: 1, borderColor: COLORS.accent },
  textoExplorar: { color: COLORS.accent, fontWeight: "bold" },
  
  itemContainer: { flexDirection: "row", backgroundColor: COLORS.inputBg, borderRadius: 12, padding: 12, marginBottom: 16, alignItems: "center" },
  itemImagem: { width: 60, height: 90, borderRadius: 6, backgroundColor: "#2A2735" },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
  itemTitulo: { color: COLORS.text, fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  itemAutor: { color: COLORS.sub, fontSize: 13, marginBottom: 4 },
  itemPreco: { color: COLORS.title, fontSize: 16, fontWeight: "bold" },
  btnRemover: { padding: 8 },
  
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: COLORS.inputBg, padding: 20, borderTopWidth: 1, borderTopColor: "#2A2735", paddingBottom: 30 },
  linhaTotal: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16, alignItems: "flex-end" },
  labelTotal: { color: COLORS.sub, fontSize: 16 },
  valorTotal: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
  btnFinalizar: { backgroundColor: COLORS.button, flexDirection: "row", height: 54, borderRadius: 12, alignItems: "center", justifyContent: "center", elevation: 4 },
  textoBtnFinalizar: { color: "#FFF", fontSize: 18, fontWeight: "bold", marginRight: 8 },
});