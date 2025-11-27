import { Stack } from "expo-router";
import { AuthProvider } from "../contexto/AuthContext";
import { CarrinhoProvider } from "../contexto/CarrinhoContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* O CarrinhoProvider PRECISA estar aqui para funcionar */}
      <CarrinhoProvider> 
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="detalhesLivro" options={{ headerShown: false }} />
          <Stack.Screen name="carrinho" options={{ headerShown: false }} />
          <Stack.Screen name="finalizarCompra" options={{ headerShown: false }} />
        </Stack>
      </CarrinhoProvider>
    </AuthProvider>
  );
}