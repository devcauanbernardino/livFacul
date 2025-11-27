import { supabase } from "@/lib/supabase"; // Importando Supabase
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexto/AuthContext"; // Importando Usuário
import { useCarrinho } from "../contexto/CarrinhoContext";
import COLORS from "../src/constants/theme/colors";

export default function FinalizarCompra() {
  const router = useRouter();
  const { total } = useLocalSearchParams();
  
  // Agora pegamos também os 'itens' para poder salvá-los no banco
  const { limparCarrinho, itens } = useCarrinho(); 
  const { usuario } = useAuth();
  
  const [metodoPagamento, setMetodoPagamento] = useState("pix");
  const [processando, setProcessando] = useState(false);

  const valorTotal = Number(total || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const handleConfirmarPedido = async () => {
    if (!usuario) {
      Alert.alert("Erro", "Usuário não identificado.");
      return;
    }

    setProcessando(true);

    try {
      // 1. Prepara os dados para salvar na tabela 'minha_biblioteca'
      const compras = itens.map(livro => ({
        user_id: usuario.id,
        livro_id: Number(livro.id) // Garante que é número
      }));

      // 2. Salva no Supabase
      const { error } = await supabase
        .from('minha_biblioteca')
        .insert(compras);

      if (error) throw error;

      // 3. Sucesso: Limpa carrinho e avisa
      limparCarrinho();
      
      Alert.alert(
        "Compra realizada! 📚",
        "Os livros foram adicionados à sua biblioteca.",
        [
          {
            text: "Ir para Biblioteca",
            onPress: () => {
                router.dismissAll();
                router.push("/(tabs)/biblioteca");
            },
          },
        ]
      );

    } catch (error: any) {
      console.error("Erro na compra:", error);
      Alert.alert("Erro", "Não foi possível finalizar a compra. Tente novamente.");
    } finally {
      setProcessando(false);
    }
  };

  return (
    <SafeAreaView style={estilos.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={estilos.header}>
        <TouchableOpacity onPress={() => router.back()} style={estilos.btnVoltar}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={estilos.headerTitulo}>Pagamento</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={estilos.content}>
        <View style={estilos.secao}>
          <Text style={estilos.tituloSecao}>Resumo do Pedido</Text>
          <View style={estilos.cardResumo}>
            {/* Listar os itens brevemente */}
            {itens.map((item, index) => (
                <Text key={index} style={estilos.itemResumo} numberOfLines={1}>
                    • {item.titulo}
                </Text>
            ))}
            <View style={estilos.divisor} />
            <View style={estilos.linhaResumo}>
              <Text style={estilos.labelTotal}>Total a pagar</Text>
              <Text style={estilos.valorTotal}>{valorTotal}</Text>
            </View>
          </View>
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.tituloSecao}>Forma de Pagamento</Text>
          <TouchableOpacity 
            style={[estilos.opcaoPagamento, metodoPagamento === "pix" && estilos.pagamentoAtivo]}
            onPress={() => setMetodoPagamento("pix")}
          >
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="qr-code-outline" size={24} color={metodoPagamento === "pix" ? COLORS.button : COLORS.sub} />
                <Text style={[estilos.textoPagamento, metodoPagamento === "pix" && estilos.textoPagamentoAtivo]}>Pix (Aprovação Imediata)</Text>
            </View>
            {metodoPagamento === "pix" && <Ionicons name="checkmark-circle" size={20} color={COLORS.button} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[estilos.opcaoPagamento, metodoPagamento === "cartao" && estilos.pagamentoAtivo]}
            onPress={() => setMetodoPagamento("cartao")}
          >
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="card-outline" size={24} color={metodoPagamento === "cartao" ? COLORS.button : COLORS.sub} />
                <Text style={[estilos.textoPagamento, metodoPagamento === "cartao" && estilos.textoPagamentoAtivo]}>Cartão de Crédito</Text>
            </View>
            {metodoPagamento === "cartao" && <Ionicons name="checkmark-circle" size={20} color={COLORS.button} />}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={estilos.footer}>
        <TouchableOpacity 
            style={estilos.btnConfirmar} 
            onPress={handleConfirmarPedido}
            disabled={processando}
        >
          {processando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={estilos.textoBtnConfirmar}>Confirmar e Comprar</Text>
          )}
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
  content: { padding: 20 },
  secao: { marginBottom: 24 },
  tituloSecao: { color: COLORS.text, fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  cardResumo: { backgroundColor: COLORS.inputBg, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.inputBorder },
  itemResumo: { color: COLORS.sub, fontSize: 13, marginBottom: 4 },
  linhaResumo: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  divisor: { height: 1, backgroundColor: "#2A2735", marginVertical: 12 },
  labelTotal: { color: COLORS.text, fontSize: 16, fontWeight: "bold" },
  valorTotal: { color: COLORS.title, fontSize: 18, fontWeight: "bold" },
  opcaoPagamento: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.inputBg, padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.inputBorder },
  pagamentoAtivo: { borderColor: COLORS.button, backgroundColor: "rgba(124, 58, 237, 0.1)" },
  textoPagamento: { color: COLORS.sub, marginLeft: 12, fontSize: 15 },
  textoPagamentoAtivo: { color: COLORS.text, fontWeight: "600" },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: "#2A2735", paddingBottom: 30 },
  btnConfirmar: { backgroundColor: "#10B981", height: 54, borderRadius: 12, alignItems: "center", justifyContent: "center", elevation: 4 },
  textoBtnConfirmar: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});