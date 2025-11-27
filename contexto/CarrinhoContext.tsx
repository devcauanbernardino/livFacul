import React, { createContext, useContext, useState } from "react";
import { Alert } from "react-native";

export type ItemCarrinho = {
  id: string;
  titulo: string;
  autor: string;
  preco: number;
  imagem?: string;
};

type CarrinhoContextType = {
  itens: ItemCarrinho[];
  // Atualizado para aceitar modo silencioso e retornar sucesso/falha
  adicionarItem: (item: ItemCarrinho, silencioso?: boolean) => boolean;
  removerItem: (id: string) => void;
  limparCarrinho: () => void;
  total: number;
};

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined);

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  function adicionarItem(novoItem: ItemCarrinho, silencioso = false) {
    console.log(`[CARRINHO] Tentando adicionar: ${novoItem.titulo}`);

    const jaExiste = itens.some((i) => i.id === novoItem.id);
    
    if (jaExiste) {
      console.log("[CARRINHO] Item já existe.");
      if (!silencioso) {
        Alert.alert("Aviso", "Este livro já está no seu carrinho.");
      }
      return false; // Retorna falso indicando que não adicionou
    }

    setItens((listaAtual) => {
      const novaLista = [...listaAtual, novoItem];
      console.log("[CARRINHO] Nova lista:", novaLista.length, "itens");
      return novaLista;
    });
    
    if (!silencioso) {
      Alert.alert("Sucesso", `"${novoItem.titulo}" foi adicionado ao carrinho.`);
    }
    return true; // Retorna verdadeiro indicando sucesso
  }

  function removerItem(id: string) {
    console.log(`[CARRINHO] Removendo item ID: ${id}`);
    setItens((prev) => prev.filter((item) => item.id !== id));
  }

  function limparCarrinho() {
    console.log("[CARRINHO] Limpando tudo.");
    setItens([]);
  }

  const total = itens.reduce((acc, item) => acc + item.preco, 0);

  return (
    <CarrinhoContext.Provider value={{ itens, adicionarItem, removerItem, limparCarrinho, total }}>
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const context = useContext(CarrinhoContext);
  if (!context) {
    throw new Error("useCarrinho deve ser usado dentro de um CarrinhoProvider");
  }
  return context;
}