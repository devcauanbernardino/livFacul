import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import CORES from "@/constants/theme/colors";
import { useAuth } from "contexto/AuthContext";

import CampoTextoPadrao from "components/FormPadrao";
import SeletorFotoPerfil from "components/FotoPerfil";

export default function TelaEditarPerfil() {
  const router = useRouter();
  const { usuario, atualizarUsuario } = useAuth();

  // Se o usuário não estiver logado, mostramos só um aviso e um botão pra login.
  if (!usuario) {
    return (
      <SafeAreaView style={estilos.areaSegura}>
        <View style={estilos.container}>
          <Text style={estilos.avisoTexto}>
            Você precisa estar logado para editar o perfil.
          </Text>

          <TouchableOpacity
            style={estilos.botaoPrimario}
            activeOpacity={0.9}
            onPress={() => {
              router.replace("/login");
            }}
          >
            <Text style={estilos.textoBotaoPrimario}>Ir para login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // estados locais editáveis baseados no usuário logado
  const [nomeEditado, setNomeEditado] = useState<string>(
    usuario.nome || ""
  );

  const [fotoEditada, setFotoEditada] = useState<any>(
    usuario.avatarLocal || null
  );

  // salvar alterações
  function salvar() {
    // valida nome
    if (!nomeEditado.trim()) {
      Alert.alert("Nome inválido", "Seu nome não pode estar vazio.");
      return;
    }

    // segurança extra: se por algum motivo o contexto sumiu
    if (!usuario) {
      Alert.alert(
        "Erro",
        "Usuário não encontrado. Faça login novamente."
      );
      return;
    }

    // atualiza no contexto global
    atualizarUsuario({
      nome: nomeEditado.trim(),
      avatarLocal: fotoEditada || usuario.avatarLocal,
    });

    Alert.alert("Prontinho", "Seu perfil foi atualizado.");
    router.back();
  }

  return (
    <SafeAreaView style={estilos.areaSegura}>
      <View style={estilos.container}>
        {/* TOPO: botão voltar + título */}
        <View style={estilos.linhaTopo}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={estilos.botaoVoltar}
            activeOpacity={0.8}
          >
            <Text style={estilos.textoVoltar}>◀</Text>
          </TouchableOpacity>

          <Text style={estilos.tituloTela}>Editar perfil</Text>
        </View>

        {/* FOTO DE PERFIL */}
        <View style={estilos.blocoFoto}>
          <SeletorFotoPerfil
            value={fotoEditada}
            onChange={setFotoEditada}
            size={96}
          />

          <Text style={estilos.dicaFoto}>
            Toque para alterar sua foto de perfil
          </Text>
        </View>

        {/* NOME */}
        <CampoTextoPadrao
          rotulo="Seu nome"
          valor={nomeEditado}
          aoAlterarTexto={setNomeEditado}
          placeholder="Seu nome"
          erro={null}
        />

        {/* PROGRESSO DE LEITOR (somente display) */}
        <View style={estilos.blocoProgresso}>
          <Text style={estilos.rotuloProgresso}>Nível leitor</Text>

          <View style={estilos.barraProgressoFundo}>
            <View
              style={[
                estilos.barraProgressoPreenchida,
                {
                  width: `${Math.round(
                    (usuario.progressoLeitor || 0) * 100
                  )}%`,
                } as ViewStyle,
              ]}
            />
          </View>

          <Text style={estilos.textoProgresso}>
            {(usuario.progressoLeitor || 0) * 100 >= 1
              ? `${Math.round(
                  (usuario.progressoLeitor || 0) * 100
                )}%`
              : "0%"}{" "}
            concluído
          </Text>
        </View>

        {/* BOTÃO SALVAR */}
        <TouchableOpacity
          style={estilos.botaoPrimario}
          activeOpacity={0.9}
          onPress={salvar}
        >
          <Text style={estilos.textoBotaoPrimario}>
            Salvar alterações
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// estilos
const estilos = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: CORES.bg,
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  linhaTopo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  botaoVoltar: {
    backgroundColor: CORES.inputBg,
    borderColor: CORES.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  textoVoltar: {
    color: CORES.text,
    fontSize: 16,
    fontWeight: "600",
  },

  tituloTela: {
    color: CORES.title,
    fontSize: 18,
    fontWeight: "700",
  },

  blocoFoto: {
    alignItems: "center",
    marginBottom: 24,
  },

  dicaFoto: {
    color: CORES.sub,
    fontSize: 12,
    marginTop: 8,
  },

  blocoProgresso: {
    marginTop: 12,
    marginBottom: 24,
  },

  rotuloProgresso: {
    color: CORES.text,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },

  barraProgressoFundo: {
    width: "100%",
    height: 6,
    backgroundColor: CORES.inputBg,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CORES.inputBorder,
  },

  barraProgressoPreenchida: {
    height: "100%",
    backgroundColor: CORES.button,
    borderRadius: 999,
  },

  textoProgresso: {
    color: CORES.sub,
    fontSize: 11,
    marginTop: 6,
  },

  botaoPrimario: {
    backgroundColor: CORES.button,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  textoBotaoPrimario: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  avisoTexto: {
    color: CORES.text,
    textAlign: "center",
    fontSize: 14,
    marginBottom: 20,
  },
});
