import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexto/AuthContext";

export default function CadastroLivro() {
  const router = useRouter();
  const { usuario } = useAuth();

  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [ano, setAno] = useState("");
  const [paginas, setPaginas] = useState("");
  const [genero, setGenero] = useState("");
  const [editora, setEditora] = useState("");
  const [sinopse, setSinopse] = useState("");
  const [preco, setPreco] = useState("");

  const [capaUri, setCapaUri] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [pdfNome, setPdfNome] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // Selecionar imagem
  async function escolherImagem() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Precisamos de acesso à galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [2, 3],
    });

    if (!result.canceled) {
      setCapaUri(result.assets[0].uri);
    }
  }

  // Selecionar PDF
  async function escolherArquivo() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setPdfUri(result.assets[0].uri);
        setPdfNome(result.assets[0].name);
        console.log("📄 PDF Selecionado:", result.assets[0].name);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível selecionar o arquivo.");
    }
  }

  // Upload robusto (usando fetch → ArrayBuffer)
  async function uploadParaStorage(
    bucket: string,
    caminho: string,
    uri: string,
    tipoArquivo: "image" | "pdf"
  ): Promise<string | null> {
    try {
      console.log(`⬆️ Upload para '${bucket}' → ${caminho}`);

      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error("Falha ao acessar arquivo local.");
      }

      const arquivoBinario = await response.arrayBuffer();
      const contentType =
        tipoArquivo === "pdf" ? "application/pdf" : "image/jpeg";

      const { error } = await supabase.storage
        .from(bucket)
        .upload(caminho, arquivoBinario, {
          upsert: true,
          contentType,
        });

      if (error) {
        console.error(`❌ Erro upload ${bucket}:`, error.message);
        return null;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(caminho);
      return data.publicUrl;
    } catch (error: any) {
      console.error("❌ Exceção upload:", error.message);
      return null;
    }
  }

  // Cadastro final
  async function cadastrar() {
    if (!usuario?.id) {
      Alert.alert("Erro", "Você precisa estar logado.");
      return;
    }

    if (!titulo || !autor || !preco) {
      Alert.alert("Atenção", "Preencha Título, Autor e Preço!");
      return;
    }

    if (!capaUri) {
      Alert.alert("Atenção", "Escolha uma imagem de capa.");
      return;
    }

    if (!pdfUri) {
      Alert.alert("Atenção", "Selecione o arquivo PDF do livro.");
      return;
    }

    try {
      setLoading(true);

      const slug =
        titulo.toLowerCase().replace(/[^a-z0-9]/g, "-") || "livro";
      const timestamp = Date.now();

      const BUCKET_CAPAS = "capas";
      const BUCKET_PDFS = "pdfs";

      // Upload da capa
      const nomeCapa = `livros/${timestamp}-${slug}.jpg`;
      const capaUrl = await uploadParaStorage(
        BUCKET_CAPAS,
        nomeCapa,
        capaUri,
        "image"
      );
      if (!capaUrl) throw new Error("Falha ao enviar a capa.");

      // Upload do PDF
      const nomePdf = `${timestamp}-${slug}.pdf`;
      let pdfUrl = await uploadParaStorage(
        BUCKET_PDFS,
        nomePdf,
        pdfUri,
        "pdf"
      );

      if (!pdfUrl) {
        console.log("⚠️ Fallback para bucket de capas...");
        pdfUrl = await uploadParaStorage(
          BUCKET_CAPAS,
          nomePdf,
          pdfUri,
          "pdf"
        );
      }

      if (!pdfUrl) throw new Error("Falha ao enviar o PDF.");

      console.log("💾 Salvando no banco...");

      // INSERT sem o campo "condicao"
      const { error } = await supabase.from("livros").insert([
        {
          titulo,
          autor,
          genero: genero || null,
          editora: editora || null,
          sinopse: sinopse || null,
          ano: ano ? Number(ano) : null,
          paginas: paginas ? Number(paginas) : null,
          preco: parseFloat(preco.replace(",", ".")),
          capa_url: capaUrl,
          pdf_url: pdfUrl,
          autor_id: usuario.id,
        },
      ]);

      if (error) {
        console.error("❌ Erro no INSERT:", error.message);
        throw error;
      }

      Alert.alert("Sucesso!", "Livro publicado com sucesso!");

      router.replace("/(tabs)/areaAutor");

      // Limpar campos
      setTitulo("");
      setAutor("");
      setAno("");
      setPaginas("");
      setGenero("");
      setEditora("");
      setSinopse("");
      setPreco("");
      setCapaUri(null);
      setPdfUri(null);
      setPdfNome(null);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#05030A" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Novo Livro</Text>

          <TouchableOpacity style={styles.capaPicker} onPress={escolherImagem}>
            {capaUri ? (
              <Image source={{ uri: capaUri }} style={styles.capaPreview} />
            ) : (
              <View style={styles.placeholderCapa}>
                <Ionicons name="image-outline" size={40} color="#7E7A99" />
                <Text style={styles.textoPlaceholder}>
                  Adicionar Capa
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Título *"
            placeholderTextColor="#7E7A99"
            value={titulo}
            onChangeText={setTitulo}
          />

          <TextInput
            style={styles.input}
            placeholder="Autor *"
            placeholderTextColor="#7E7A99"
            value={autor}
            onChangeText={setAutor}
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.metade]}
              placeholder="Preço (R$)"
              placeholderTextColor="#7E7A99"
              keyboardType="numeric"
              value={preco}
              onChangeText={setPreco}
            />
            <TextInput
              style={[styles.input, styles.metade]}
              placeholder="Gênero"
              placeholderTextColor="#7E7A99"
              value={genero}
              onChangeText={setGenero}
            />
          </View>

          <TouchableOpacity style={styles.btnArquivo} onPress={escolherArquivo}>
            <Ionicons
              name={pdfUri ? "document-text" : "cloud-upload-outline"}
              size={24}
              color={pdfUri ? "#4ADE80" : "#A78BFA"}
            />
            <Text
              style={[
                styles.btnArquivoTexto,
                pdfUri && { color: "#4ADE80" },
              ]}
            >
              {pdfNome || "Selecionar arquivo PDF"}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Editora"
            placeholderTextColor="#7E7A99"
            value={editora}
            onChangeText={setEditora}
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.metade]}
              placeholder="Ano"
              placeholderTextColor="#7E7A99"
              keyboardType="numeric"
              value={ano}
              onChangeText={setAno}
            />
            <TextInput
              style={[styles.input, styles.metade]}
              placeholder="Páginas"
              placeholderTextColor="#7E7A99"
              keyboardType="numeric"
              value={paginas}
              onChangeText={setPaginas}
            />
          </View>

          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
            placeholder="Sinopse..."
            placeholderTextColor="#7E7A99"
            multiline
            value={sinopse}
            onChangeText={setSinopse}
          />

          <TouchableOpacity
            style={[styles.btnCadastrar, loading && { opacity: 0.7 }]}
            onPress={cadastrar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnCadastrarTexto}>Publicar Livro</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  card: {
    backgroundColor: "#100D1C",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2735",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 20,
    textAlign: "center",
  },
  capaPicker: {
    width: 120,
    height: 180,
    backgroundColor: "#171327",
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2A2735",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  capaPreview: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholderCapa: { alignItems: "center", padding: 10 },
  textoPlaceholder: {
    color: "#7E7A99",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  input: {
    backgroundColor: "#171327",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    color: "#FFF",
    borderWidth: 1,
    borderColor: "#2A2735",
  },
  row: { flexDirection: "row", gap: 10 },
  metade: { flex: 1 },
  btnArquivo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(124, 58, 237, 0.1)",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#A78BFA",
    borderStyle: "dashed",
  },
  btnArquivoTexto: {
    color: "#A78BFA",
    fontWeight: "600",
    marginLeft: 10,
  },
  btnCadastrar: {
    backgroundColor: "#7C3AED",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    elevation: 4,
  },
  btnCadastrarTexto: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
