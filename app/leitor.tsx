import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import COLORS from "../src/constants/theme/colors";

export default function LeitorPdf() {
  const router = useRouter();
  const { url, titulo } = useLocalSearchParams();

  // Garante que é string
  const pdfUrl = url as string;
  
  // Truque para Android: O WebView do Android não abre PDF nativamente.
  // Usamos o Google Docs Viewer para renderizar. No iOS abre direto.
  const isAndroid = Platform.OS === 'android';
  
  const uriFinal = isAndroid
    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`
    : pdfUrl;

  if (!pdfUrl) {
    return (
      <SafeAreaView style={estilos.container}>
        <View style={estilos.erroContainer}>
          <Text style={estilos.textoErro}>Erro: URL do PDF não encontrada.</Text>
          <TouchableOpacity onPress={() => router.back()} style={estilos.btnVoltar}>
            <Text style={estilos.textoVoltar}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      
      {/* Header Simples */}
      <View style={estilos.header}>
        <TouchableOpacity onPress={() => router.back()} style={estilos.botaoVoltar}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={estilos.titulo} numberOfLines={1}>{titulo || "Leitor"}</Text>
        <View style={{ width: 28 }} />
      </View>

      <WebView
        source={{ uri: uriFinal }}
        style={estilos.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={estilos.loading}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={estilos.textoCarregando}>Carregando livro...</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2735',
    backgroundColor: COLORS.bg,
  },
  botaoVoltar: { padding: 4 },
  titulo: { color: '#FFF', fontSize: 16, fontWeight: 'bold', flex: 1, textAlign: 'center', marginHorizontal: 10 },
  
  webview: { flex: 1, backgroundColor: '#FFF' }, 
  
  loading: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg
  },
  textoCarregando: { color: COLORS.sub, marginTop: 10 },
  
  erroContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  textoErro: { color: '#EF4444', marginBottom: 20, fontSize: 16 },
  btnVoltar: { padding: 10, backgroundColor: COLORS.inputBg, borderRadius: 8 },
  textoVoltar: { color: '#FFF' }
});