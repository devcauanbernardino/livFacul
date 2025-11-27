// app/(tabs)/cadastro_cliente.tsx
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CORES from "@/constants/theme/colors";
import CampoTextoPadrao from "components/FormPadrao";
import SeletorFotoPerfil from "components/FotoPerfil";
import ForcaSenha from "components/SenhaForca";

import { mascaraCPF, mascaraData } from "utilitarios/formatador";
import { calcularForcaSenha, senhaValida } from "utilitarios/senha";
import { validarCPF, validarDataBR, validarEmail } from "utilitarios/validador";

import { supabase } from "@/lib/supabase";
import { uploadAvatarToSupabase } from "@/lib/uploadAvatar";
import { useAuth } from "contexto/AuthContext";

export default function CadastroCliente() {
  const navegar = useRouter();
  const { loginDireto } = useAuth();

  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState<"leitor" | "autor">("leitor");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [senhaFocada, setSenhaFocada] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [toque, setToque] = useState({
    nome: false,
    cpf: false,
    dataNasc: false,
    email: false,
    senha: false,
    confirmarSenha: false,
  });

  // limpa arquivos temporários do avatar
  useEffect(() => {
    const paths = [
      FileSystem.documentDirectory + "profile.jpg",
      FileSystem.documentDirectory + "profile-draft.jpg",
    ];
    (async () => {
      for (const p of paths) {
        try {
          await FileSystem.deleteAsync(p, { idempotent: true });
        } catch {}
      }
    })();
  }, []);

  // animação de entrada
  const animacao = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animacao, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [animacao]);

  const deslocamentoY = animacao.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });
  const opacidade = animacao;

  // validações
  const nomeValido = nome.trim().length >= 3;
  const cpfValido = validarCPF(cpf);
  const dataValida = validarDataBR(dataNasc);
  const emailValido = validarEmail(email);
  const infoSenha = calcularForcaSenha(senha);
  const senhaBoa = senhaValida(infoSenha);
  const senhasBatendo = senha === confirmarSenha && confirmarSenha.length > 0;

  const tudoValido =
    nomeValido &&
    cpfValido &&
    dataValida &&
    emailValido &&
    senhaBoa &&
    senhasBatendo;

  async function enviarCadastro() {
    if (!tudoValido) {
      Alert.alert("Dados incompletos", "Verifique os campos destacados.");
      return;
    }

    try {
      setEnviando(true);

      const [dia, mes, ano] = dataNasc.split("/");
      const dataISO = `${ano}-${mes}-${dia}`;
      const emailNorm = email.toLowerCase().trim();

      // 1) Cria usuário no Auth
      const { data: signData, error: signErr } = await supabase.auth.signUp({
        email: emailNorm,
        password: senha,
        options: { data: { name: nome.trim() } },
      });

      if (signErr || !signData?.user) {
        Alert.alert(
          "Erro ao criar conta",
          signErr?.message || "Tente novamente."
        );
        return;
      }

      const userId = signData.user.id;

      // garante sessão (caso o projeto não crie automaticamente)
      if (!signData.session) {
        await supabase.auth.signInWithPassword({
          email: emailNorm,
          password: senha,
        });
      }

      // 2) Avatar
      let avatarPublicUrl: string | null = null;
      if (fotoPerfil) {
        try {
          avatarPublicUrl = await uploadAvatarToSupabase(fotoPerfil, userId);
        } catch (e) {
          console.warn("Erro ao subir avatar:", e);
        }
      }

      // 3) Perfil na tabela `usuarios`
      const perfilPayload = {
        id: userId,
        nome: nome.trim(),
        cpf: cpf.replace(/\D/g, ""),
        data_nascimento: dataISO,
        email: emailNorm,
        tipo_usuario: tipoUsuario,
        avatar_url: avatarPublicUrl,
        progresso_leitor: 0,
      };

      const { data, error } = await supabase
        .from("usuarios")
        .upsert(perfilPayload, { onConflict: "id" })
        .select(
          "id, nome, email, avatar_url, progresso_leitor, tipo_usuario, divisao"
        )
        .single();

      if (error || !data) {
        Alert.alert(
          "Erro ao salvar perfil",
          error?.message || "Tente novamente."
        );
        return;
      }

      const finalUrl = avatarPublicUrl || data.avatar_url || null;
      const bust = finalUrl
        ? `${finalUrl}${finalUrl.includes("?") ? "&" : "?"}cb=${Date.now()}`
        : null;

      // 4) Atualiza contexto (logar dentro do app)
      loginDireto({
        id: data.id,
        nome: data.nome,
        email: data.email,
        tipoUsuario: data.tipo_usuario ?? "leitor",
        progressoLeitor:
          typeof data.progresso_leitor === "number"
            ? data.progresso_leitor
            : 0,
        divisao: data.divisao ?? "Iniciante",
        avatarUrlRemota: bust,
        avatarLocal: fotoPerfil ? { uri: fotoPerfil } : undefined,
      });

      Alert.alert("Conta criada!", "Cadastro feito. Você já está logado 😌");

      // ✅ REGRA NOVA: independente do tipo, vai para o INDEX
      navegar.replace("/");
    } catch (e) {
      console.error(e);
      Alert.alert(
        "Erro",
        "Não foi possível concluir seu cadastro agora. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={estilos.areaSegura} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView behavior={undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              estilos.container,
              { opacity: opacidade, transform: [{ translateY: deslocamentoY }] },
            ]}
          >
            <View style={estilos.cabecalho}>
              <Image
                source={require("../../assets/images/lua.png")}
                style={estilos.logo}
                resizeMode="contain"
              />
              <Text style={estilos.subtituloCabecalho}>
                Cadastre-se para anunciar e comprar livros
              </Text>
            </View>

            <View style={estilos.blocoFoto}>
              <SeletorFotoPerfil
                value={fotoPerfil}
                onChange={setFotoPerfil}
                size={96}
                filename="profile-draft.jpg"
                autoLoadPersisted={false}
              />
              <Text style={estilos.legendaFoto}>
                (opcional) Escolha uma foto de perfil
              </Text>
            </View>

            <CampoTextoPadrao
              rotulo="Nome completo"
              valor={nome}
              aoAlterarTexto={setNome}
              aoPerderFoco={() => setToque((s) => ({ ...s, nome: true }))}
              placeholder="Seu nome completo"
              erro={
                toque.nome && !nomeValido
                  ? "Informe ao menos 3 caracteres"
                  : null
              }
            />

            <CampoTextoPadrao
              rotulo="CPF"
              valor={cpf}
              aoAlterarTexto={(v) => setCpf(mascaraCPF(v))}
              aoPerderFoco={() => setToque((s) => ({ ...s, cpf: true }))}
              placeholder="000.000.000-00"
              tipoTeclado="numeric"
              erro={toque.cpf && !cpfValido ? "CPF inválido" : null}
            />

            <CampoTextoPadrao
              rotulo="Data de nascimento"
              valor={dataNasc}
              aoAlterarTexto={(v) => setDataNasc(mascaraData(v))}
              aoPerderFoco={() => setToque((s) => ({ ...s, dataNasc: true }))}
              placeholder="DD/MM/AAAA"
              tipoTeclado="numeric"
              erro={
                toque.dataNasc && !dataValida
                  ? "Data inválida ou futura"
                  : null
              }
            />

            <CampoTextoPadrao
              rotulo="E-mail"
              valor={email}
              aoAlterarTexto={setEmail}
              aoPerderFoco={() => setToque((s) => ({ ...s, email: true }))}
              placeholder="seu@email.com"
              tipoTeclado="email-address"
              autoCapitalizar="none"
              erro={toque.email && !emailValido ? "E-mail inválido" : null}
            />

            <CampoTextoPadrao
              rotulo="Senha"
              valor={senha}
              aoAlterarTexto={setSenha}
              placeholder="Mínimo 8 caracteres"
              senhaOculta={!mostrarSenha}
              aoFocar={() => setSenhaFocada(true)}
              aoPerderFoco={() => {
                setToque((s) => ({ ...s, senha: true }));
                setSenhaFocada(false);
              }}
            />

            <TouchableOpacity
              onPress={() => setMostrarSenha((v) => !v)}
              style={estilos.toggleSenha}
            >
              <Text style={estilos.toggleSenhaTexto}>
                {mostrarSenha ? "Ocultar senha 👁️‍🗨️" : "Mostrar senha 👁️"}
              </Text>
            </TouchableOpacity>

            {senhaFocada && <ForcaSenha pwd={infoSenha} />}

            <CampoTextoPadrao
              rotulo="Confirmar senha"
              valor={confirmarSenha}
              aoAlterarTexto={setConfirmarSenha}
              placeholder="Repita a senha"
              senhaOculta={!mostrarConfirmar}
              aoPerderFoco={() =>
                setToque((s) => ({ ...s, confirmarSenha: true }))
              }
              erro={
                toque.confirmarSenha && !senhasBatendo
                  ? "As senhas não coincidem"
                  : null
              }
            />

            <TouchableOpacity
              onPress={() => setMostrarConfirmar((v) => !v)}
              style={estilos.toggleSenha}
            >
              <Text style={estilos.toggleSenhaTexto}>
                {mostrarConfirmar
                  ? "Ocultar confirmação 👁️‍🗨️"
                  : "Mostrar confirmação 👁️"}
              </Text>
            </TouchableOpacity>

            <Text style={estilos.rotuloTipoConta}>
              Você quer se cadastrar como:
            </Text>

            <View style={estilos.linhaTipoConta}>
              <TouchableOpacity
                style={[
                  estilos.opcaoTipoConta,
                  tipoUsuario === "leitor" && estilos.opcaoAtiva,
                ]}
                activeOpacity={0.9}
                onPress={() => setTipoUsuario("leitor")}
              >
                <Text
                  style={[
                    estilos.textoTipoConta,
                    tipoUsuario === "leitor" && estilos.textoTipoAtivo,
                  ]}
                >
                  Leitor 👓
                </Text>
                <Text style={estilos.subTipoConta}>
                  Comprar e ler e-books
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  estilos.opcaoTipoConta,
                  tipoUsuario === "autor" && estilos.opcaoAtiva,
                ]}
                activeOpacity={0.9}
                onPress={() => setTipoUsuario("autor")}
              >
                <Text
                  style={[
                    estilos.textoTipoConta,
                    tipoUsuario === "autor" && estilos.textoTipoAtivo,
                  ]}
                >
                  Autor ✍️
                </Text>
                <Text style={estilos.subTipoConta}>
                  Publicar meus próprios livros
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                estilos.botaoCriar,
                (!tudoValido || enviando) && estilos.botaoDesativado,
              ]}
              onPress={enviarCadastro}
              disabled={!tudoValido || enviando}
              activeOpacity={0.9}
            >
              <Text style={estilos.textoBotaoCriar}>
                {enviando ? "Enviando..." : "Criar conta"}
              </Text>
            </TouchableOpacity>

            <View style={estilos.blocoLoginLink}>
              <Text style={{ color: CORES.sub }}>Já tem conta?</Text>
              <TouchableOpacity
                onPress={() => navegar.replace("/login")}
                disabled={enviando}
              >
                <Text style={estilos.linkEntrar}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: { flex: 1, backgroundColor: CORES.bg },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    paddingVertical: 40,
  },
  cabecalho: { alignItems: "center", marginBottom: 24 },
  logo: { width: 90, height: 90, marginBottom: 12 },
  subtituloCabecalho: {
    color: CORES.sub,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 260,
  },
  blocoFoto: { marginBottom: 24, alignItems: "center" },
  legendaFoto: { marginTop: 8, fontSize: 12, color: CORES.sub },
  rotuloTipoConta: {
    color: CORES.text,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
  },
  linhaTipoConta: { flexDirection: "column", gap: 12 },
  opcaoTipoConta: {
    borderWidth: 1,
    borderColor: CORES.inputBorder,
    backgroundColor: CORES.inputBg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  opcaoAtiva: {
    borderColor: CORES.accent,
    backgroundColor: "rgba(124,58,237,0.18)",
  },
  textoTipoConta: { color: CORES.text, fontSize: 15, fontWeight: "600" },
  textoTipoAtivo: { color: CORES.accent },
  subTipoConta: { color: CORES.sub, fontSize: 12, marginTop: 4 },
  botaoCriar: {
    marginTop: 24,
    backgroundColor: CORES.button,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  botaoDesativado: { opacity: 0.5 },
  textoBotaoCriar: { color: "white", fontWeight: "700", fontSize: 16 },
  blocoLoginLink: { marginTop: 16, alignItems: "center" },
  linkEntrar: { color: CORES.accent, marginTop: 6, fontWeight: "600" },
  toggleSenha: { marginTop: 6, marginBottom: 8, alignSelf: "flex-end" },
  toggleSenhaTexto: { color: CORES.accent, fontSize: 12, fontWeight: "600" },
});
