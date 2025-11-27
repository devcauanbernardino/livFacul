// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="areaAutor" />
      <Tabs.Screen name="cadastroLivro" />
      <Tabs.Screen name="cadastro_cliente" />
      <Tabs.Screen name="login" />
      <Tabs.Screen name="EditarPerfil" />
      <Tabs.Screen name="modal" />
      <Tabs.Screen name="splash" />
    </Tabs>
  );
}
