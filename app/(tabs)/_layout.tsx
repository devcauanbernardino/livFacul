// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,       // 👈 esconde o título e cabeçalho
        tabBarShowLabel: false,   // 👈 remove o texto das abas
        tabBarStyle: { display: "none" }, // 👈 remove totalmente a barra inferior
      }}
    >
      <Tabs.Screen name="index" />
    </Tabs>
  );
}
