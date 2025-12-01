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
  const [nomeEditado, setNomeEditado] = useState<string>(usuario.nome || "");

  const [fotoEditada, setFotoEditada] = useState<any>(
    usuario.avatarLocal || null
  );

  const nomeMudou = nomeEditado.trim() !== usuario.nome;
  const fotoMudou = fotoEditada?.uri !== usuario.avatarLocal?.uri;

  // salvar alterações
  function salvar() {
    // segurança extra: se por algum motivo o contexto sumiu
    if (!usuario) {
      Alert.alert("Erro", "Usuário não encontrado. Faça login novamente.");
      return;
    }

    // Se nada mudou, apenas volta para a tela anterior.
    if (!nomeMudou && !fotoMudou) {
      router.back();
      return;
    }

    if (!nomeEditado.trim()) {
      Alert.alert("Nome inválido", "Seu nome não pode estar vazio.");
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

  // Função para o botão de voltar
  const handleVoltar = () => {
    // Adiciona uma verificação para garantir que o usuário não é nulo.
    // Embora improvável de acontecer, isso satisfaz o TypeScript.
    if (!usuario) {
      router.back();
      return;
    }
    // Reseta os estados para os valores originais do contexto
    setNomeEditado(usuario.nome || "");
    setFotoEditada(usuario.avatarLocal || null);
    // Navega de volta
    router.back();
  }

  return (
    <SafeAreaView style={estilos.areaSegura}>
      <View style={estilos.container2}>
        {/* TOPO: botão voltar + título */}
        <View style={estilos.linhaTopo}>
          <TouchableOpacity
            onPress={handleVoltar}
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
                  width: `${Math.round((usuario.progressoLeitor || 0) * 100)}%`,
                } as ViewStyle,
              ]}
            />
          </View>

          <Text style={estilos.textoProgresso}>
            {(usuario.progressoLeitor || 0) * 100 >= 1
              ? `${Math.round((usuario.progressoLeitor || 0) * 100)}%`
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
          <Text style={estilos.textoBotaoPrimario}>Salvar alterações</Text>
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
    justifyContent: "center",
    alignItems: "center",
  },

  container2: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 50,
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
    padding: 5,
  },

  avisoTexto: {
    color: CORES.text,
    textAlign: "center",
    fontSize: 14,
    marginBottom: 20,
  },
});
